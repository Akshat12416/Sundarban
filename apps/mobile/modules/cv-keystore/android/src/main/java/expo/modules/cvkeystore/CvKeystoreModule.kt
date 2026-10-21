package expo.modules.cvkeystore

import android.os.Build
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyInfo
import android.security.keystore.KeyProperties
import android.util.Base64
import io.github.expo.modules.v2.ExpoModule
import io.github.expo.modules.v2.JS
import io.github.expo.modules.v2.Module
import io.github.expo.modules.v2.TypedArray
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.security.KeyFactory
import java.security.KeyPairGenerator
import java.security.KeyStore
import java.security.Signature
import java.security.spec.ECGenParameterSpec

/**
 * EC P-256 key that stays inside the Android Keystore.
 * Purpose is SIGN, digest is SHA-256, and the private key is not exportable.
 * StrongBox is tried first. If the device rejects it, the same spec is created
 * without StrongBox so the TEE can hold the key. There is no software-key path.
 */
@ExpoModule("CvKeystore")
class CvKeystoreModule : Module() {
  @JS
  suspend fun generateKey(alias: String): String = withContext(Dispatchers.Default) {
    val store = keyStore()
    if (!store.containsAlias(alias)) {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
        try {
          generate(alias, strongBox = true)
        } catch (_: Exception) {
          generate(alias, strongBox = false)
        }
      } else {
        generate(alias, strongBox = false)
      }
    }
    securityLevel(alias)
  }

  @JS
  suspend fun getPublicKey(alias: String): String = withContext(Dispatchers.Default) {
    val certificate = keyStore().getCertificate(alias)
      ?: throw IllegalStateException("No keystore key for $alias")
    toPem(certificate.publicKey.encoded)
  }

  @JS
  suspend fun sign(alias: String, data: TypedArray): String = withContext(Dispatchers.Default) {
    val privateKey = keyStore().getKey(alias, null)
      ?: throw IllegalStateException("No keystore key for $alias")
    val buffer = data.toDirectBuffer()
    val bytes = ByteArray(buffer.remaining())
    buffer.get(bytes)
    val signature = Signature.getInstance("SHA256withECDSA")
    signature.initSign(privateKey)
    signature.update(bytes)
    signature.sign().joinToString(separator = "") { byte -> "%02x".format(byte.toInt() and 0xff) }
  }

  @JS
  suspend fun securityLevel(alias: String): String = withContext(Dispatchers.Default) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
      return@withContext "unknown"
    }
    val publicKey = keyStore().getCertificate(alias)?.publicKey
      ?: throw IllegalStateException("No keystore key for $alias")
    val info = KeyFactory.getInstance(publicKey.algorithm, "AndroidKeyStore")
      .getKeySpec(publicKey, KeyInfo::class.java)
    when (info.securityLevel) {
      KeyProperties.SECURITY_LEVEL_STRONGBOX -> "StrongBox"
      KeyProperties.SECURITY_LEVEL_TRUSTED_ENVIRONMENT -> "TEE"
      KeyProperties.SECURITY_LEVEL_SOFTWARE -> "software"
      else -> "unknown"
    }
  }

  private fun generate(alias: String, strongBox: Boolean) {
    val generator = KeyPairGenerator.getInstance(KeyProperties.KEY_ALGORITHM_EC, "AndroidKeyStore")
    val builder = KeyGenParameterSpec.Builder(alias, KeyProperties.PURPOSE_SIGN)
      .setAlgorithmParameterSpec(ECGenParameterSpec("secp256r1"))
      .setDigests(KeyProperties.DIGEST_SHA256)
    if (strongBox && Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
      builder.setIsStrongBoxBacked(true)
    }
    generator.initialize(builder.build())
    generator.generateKeyPair()
  }

  private fun keyStore(): KeyStore {
    return KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
  }

  private fun toPem(encoded: ByteArray): String {
    val body = Base64.encodeToString(encoded, Base64.NO_WRAP).chunked(64).joinToString("\n")
    return "-----BEGIN PUBLIC KEY-----\n$body\n-----END PUBLIC KEY-----\n"
  }
}
