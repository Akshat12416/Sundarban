import { CameraView, useCameraPermissions } from "expo-camera";
import * as Crypto from "expo-crypto";
import * as DocumentPicker from "expo-document-picker";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Field, PhoneColumn, PillButton } from "../src/components/ui";
import { attestedUpload, enrolDevice, registerProject } from "../src/capture/attest";
import { useData } from "../src/data/store";
import type { AccountKind, Project } from "../src/data/types";
import { colors } from "../src/theme/tokens";

const steps = ["Type", "Details", "Document", "Parcel", "Photos"] as const;

export default function WizardScreen() {
  const data = useData();
  const [step, setStep] = useState(0);
  const [kind, setKind] = useState<AccountKind>("individual");
  const [organisationId, setOrganisationId] = useState("");
  const [organisationName, setOrganisationName] = useState("");
  const [species, setSpecies] = useState("");
  const [treeCount, setTreeCount] = useState("");
  const [areaAcres, setAreaAcres] = useState("");
  const [region, setRegion] = useState("");
  const [description, setDescription] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [accuracy, setAccuracy] = useState("");
  const [radiusM, setRadiusM] = useState(40);
  const [photos, setPhotos] = useState(0);
  const [cameraOn, setCameraOn] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [message, setMessage] = useState("");
  const [projectId] = useState(() => Crypto.randomUUID());
  const camera = useRef<CameraView>(null);
  const enrolled = useRef(false);

  async function pickDocument() {
    const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: false });
    if (!result.canceled && result.assets[0]) {
      setDocumentName(result.assets[0].name);
    }
  }

  async function setCentre() {
    const allowed = await Location.requestForegroundPermissionsAsync();
    if (!allowed.granted) {
      setMessage("Location permission is required to set the parcel centre.");
      return;
    }
    const position = await Location.getCurrentPositionAsync({});
    setLatitude(position.coords.latitude.toFixed(6));
    setLongitude(position.coords.longitude.toFixed(6));
    const metres = position.coords.accuracy;
    setAccuracy(metres === null || metres === undefined ? "" : metres.toFixed(1));
    setMessage("");
  }

  async function capture(): Promise<boolean> {
    if (!permission?.granted) {
      const next = await requestPermission();
      if (!next.granted) {
        setMessage("Camera permission is required for evidence photos.");
        return false;
      }
    }
    setCameraOn(true);
    const shot = await camera.current?.takePictureAsync({ quality: 1 });
    if (!shot?.uri) {
      setMessage("The camera did not return a photo. Use the Android development build, not Expo Go, for attested capture.");
      return false;
    }
    const allowed = await Location.requestForegroundPermissionsAsync();
    if (!allowed.granted) {
      setMessage("Location permission is required for an attested photo.");
      return false;
    }
    const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    try {
      if (!enrolled.current) {
        await registerProject(projectId);
        const level = await enrolDevice();
        enrolled.current = true;
        setMessage(`Phone key enrolled (${level}).`);
      }
      const result = await attestedUpload({
        projectId,
        photoUri: shot.uri,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracyM: position.coords.accuracy ?? Number.NaN,
        mockLocation: position.mocked === true,
      });
      setMessage(result.reason);
      return result.accepted;
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Attestation failed.");
      return false;
    }
  }

  async function finish() {
    if (photos < 3) {
      setMessage("Capture at least 3 before photos.");
      return;
    }
    const id = projectId;
    const project: Project = {
      id,
      kind,
      organisationId,
      organisationName,
      species,
      treeCount,
      areaAcres,
      region,
      description,
      parcel: latitude
        ? { latitude, longitude, radiusM, accuracyM: accuracy || "0.0" }
        : null,
      documentName,
      documentKind: kind === "organisation" ? "mou" : "land_record",
      beforePhotos: photos,
      afterPhotos: 0,
      status: "awaiting_after",
      adminNote: "",
      updatedAt: new Date().toISOString(),
    };
    await data.saveProject(project);
    router.replace(`/project/${id}`);
  }

  return (
    <PhoneColumn>
      <SafeAreaView style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontFamily: "Inter", color: colors.brand, fontWeight: "700" }}>
          {steps[step]} · {step + 1} of {steps.length}
        </Text>
        <Text style={{ fontFamily: "Inter", fontSize: 32, fontWeight: "700", marginBottom: 12 }}>
          {kind === "organisation" ? "Organisation" : "Individual"}
        </Text>
        <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
          {step === 0 ? (
            <>
              <PillButton label="Individual" tone={kind === "individual" ? "black" : "ghost"} onPress={() => setKind("individual")} />
              <PillButton label="Organisation" tone={kind === "organisation" ? "black" : "ghost"} onPress={() => setKind("organisation")} />
            </>
          ) : null}
          {step === 1 ? (
            <>
              {kind === "organisation" ? (
                <>
                  <Field label="Organisation id" value={organisationId} onChangeText={setOrganisationId} />
                  <Field label="Organisation name" value={organisationName} onChangeText={setOrganisationName} />
                </>
              ) : null}
              <Field label="Species" value={species} onChangeText={setSpecies} />
              <Field label="Number of trees" keyboardType="number-pad" value={treeCount} onChangeText={setTreeCount} />
              <Field label="Area in acres" keyboardType="decimal-pad" value={areaAcres} onChangeText={setAreaAcres} />
              <Field label="Region" value={region} onChangeText={setRegion} />
              <Field label="Description" value={description} onChangeText={setDescription} multiline />
            </>
          ) : null}
          {step === 2 ? (
            <>
              <View style={{ backgroundColor: colors.chip, borderRadius: 16, padding: 20 }}>
                <Text style={{ fontFamily: "Inter", fontWeight: "700" }}>
                  {kind === "organisation" ? "MOU document" : "Land record"}
                </Text>
                <Text style={{ fontFamily: "Inter", marginTop: 8 }}>{documentName || "No file selected"}</Text>
              </View>
              <PillButton label="Choose file" onPress={() => void pickDocument()} />
            </>
          ) : null}
          {step === 3 ? (
            <>
              <Text style={{ fontFamily: "Inter" }}>
                Centre {latitude || "not set"}, {longitude || "not set"}
              </Text>
              <Text style={{ fontFamily: "Inter", color: colors.muted }}>
                Accuracy {accuracy || "unknown"} m · Radius {radiusM} m
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <PillButton label="−" tone="ghost" onPress={() => setRadiusM((value) => Math.max(10, value - 10))} />
                <PillButton label="+" tone="ghost" onPress={() => setRadiusM((value) => Math.min(500, value + 10))} />
              </View>
              <PillButton label="Set parcel centre" tone="green" onPress={() => void setCentre()} />
            </>
          ) : null}
          {step === 4 ? (
            <>
              <Text style={{ fontFamily: "Inter" }}>Before photos {photos} of 3</Text>
              {cameraOn ? (
                <View style={{ height: 240, borderRadius: 16, overflow: "hidden" }}>
                  <CameraView ref={camera} style={{ flex: 1 }} facing="back" />
                </View>
              ) : null}
              <PillButton
                label="Capture attested photo"
                onPress={() => {
                  void capture().then((saved) => {
                    if (saved) {
                      setPhotos((count) => count + 1);
                    }
                  });
                }}
              />
              <Text style={{ fontFamily: "Inter", color: colors.muted }}>
                The camera takes the photo. The image picker is not used. The verifier's accept or reject reason appears below.
              </Text>
            </>
          ) : null}
          {message ? <Text style={{ fontFamily: "Inter", color: colors.danger }}>{message}</Text> : null}
        </ScrollView>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={{ flex: 1 }}>
            <PillButton label="Close" tone="ghost" onPress={() => router.back()} />
          </View>
          <View style={{ flex: 1 }}>
            {step < steps.length - 1 ? (
              <PillButton label="Next" tone="green" onPress={() => setStep((value) => value + 1)} />
            ) : (
              <PillButton label="Save before photos" tone="green" onPress={() => void finish()} />
            )}
          </View>
        </View>
      </SafeAreaView>
    </PhoneColumn>
  );
}
