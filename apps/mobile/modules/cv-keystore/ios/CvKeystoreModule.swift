import ExpoModulesCore

// iOS is out of scope. Every call throws. Do not add a software key here.
@ExpoModule("CvKeystore")
public class CvKeystoreModule: Module {
  @JS
  func generateKey(alias: String) throws -> String {
    throw NotImplementedException()
  }

  @JS
  func getPublicKey(alias: String) throws -> String {
    throw NotImplementedException()
  }

  @JS
  func sign(alias: String, data: Data) throws -> String {
    throw NotImplementedException()
  }

  @JS
  func securityLevel(alias: String) throws -> String {
    throw NotImplementedException()
  }
}

internal final class NotImplementedException: Exception {
  override var reason: String {
    "iOS keystore is out of scope. Sundarban attestation is Android only."
  }
}
