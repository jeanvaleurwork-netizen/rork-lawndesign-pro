import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { Stack, useLocalSearchParams, router } from "expo-router";
import { Upload, FileText, Image as ImageIcon, CheckCircle, X, Camera } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import Colors from "@/constants/colors";
import { trpc } from "@/lib/trpc";

type DocumentType = "photo" | "video" | "insurance" | "blueprint" | "measurement" | "other";

interface UploadedFile {
  id: string;
  uri: string;
  type: DocumentType;
  name: string;
  caption: string;
  uploadedAt: string;
}

export default function CustomerDropboxScreen() {
  const { jobId, clientId } = useLocalSearchParams();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [selectedType, setSelectedType] = useState<DocumentType>("photo");

  const uploadDocumentMutation = trpc.data.uploadCustomerDocument.useMutation();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      handleFilesSelected(result.assets.map((asset: any) => ({
        uri: asset.uri,
        type: asset.type || "photo",
        name: asset.fileName || `photo_${Date.now()}.jpg`,
      })));
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission Required", "Camera permission is needed to take photos");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets) {
      handleFilesSelected([{
        uri: result.assets[0].uri,
        type: "photo",
        name: `photo_${Date.now()}.jpg`,
      }]);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*", "video/*"],
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (!result.canceled && result.assets) {
        handleFilesSelected(result.assets.map((asset: any) => ({
          uri: asset.uri,
          type: "other",
          name: asset.name,
        })));
      }
    } catch (error) {
      console.error("Error picking document:", error);
    }
  };

  const handleFilesSelected = (selectedFiles: { uri: string; type: string; name: string }[]) => {
    const newFiles: UploadedFile[] = selectedFiles.map(file => ({
      id: Math.random().toString(),
      uri: file.uri,
      type: selectedType,
      name: file.name,
      caption: caption || "",
      uploadedAt: new Date().toISOString(),
    }));

    setFiles(prev => [...prev, ...newFiles]);
    setCaption("");
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const submitFiles = async () => {
    if (files.length === 0) {
      Alert.alert("No Files", "Please add files before submitting");
      return;
    }

    setUploading(true);
    try {
      for (const file of files) {
        await uploadDocumentMutation.mutateAsync({
          jobId: jobId as string,
          clientId: clientId as string,
          documentUrl: file.uri,
          documentType: file.type,
          description: `${file.name}${file.caption ? ` - ${file.caption}` : ""}`,
        });
      }

      Alert.alert(
        "Success!",
        "Your files have been uploaded successfully. The contractor will review them shortly.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert("Upload Failed", "There was an error uploading your files. Please try again.");
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const documentTypes: { value: DocumentType; label: string; icon: any }[] = [
    { value: "photo", label: "Photo", icon: ImageIcon },
    { value: "video", label: "Video", icon: FileText },
    { value: "insurance", label: "Insurance", icon: FileText },
    { value: "blueprint", label: "Blueprint", icon: FileText },
    { value: "measurement", label: "Measurement", icon: FileText },
    { value: "other", label: "Other", icon: FileText },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: "Upload Documents",
          headerStyle: { backgroundColor: Colors.light.primary },
          headerTintColor: "#fff",
        }} 
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Upload size={48} color={Colors.light.primary} />
          <Text style={styles.title}>Job DropBox</Text>
          <Text style={styles.subtitle}>
            Upload photos, videos, measurements, insurance documents, or any other files related to your project.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Document Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
            {documentTypes.map(type => {
              const Icon = type.icon;
              return (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeChip,
                    selectedType === type.value && styles.typeChipActive,
                  ]}
                  onPress={() => setSelectedType(type.value)}
                >
                  <Icon 
                    size={20} 
                    color={selectedType === type.value ? "#fff" : Colors.light.primary} 
                  />
                  <Text style={[
                    styles.typeChipText,
                    selectedType === type.value && styles.typeChipTextActive,
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Notes (Optional)</Text>
          <TextInput
            style={styles.captionInput}
            placeholder="Add a description or notes about these files..."
            placeholderTextColor="#999"
            value={caption}
            onChangeText={setCaption}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upload Files</Text>
          <View style={styles.uploadButtons}>
            <TouchableOpacity style={styles.uploadButton} onPress={takePhoto}>
              <Camera size={24} color={Colors.light.primary} />
              <Text style={styles.uploadButtonText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <ImageIcon size={24} color={Colors.light.primary} />
              <Text style={styles.uploadButtonText}>Choose Photos</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
              <FileText size={24} color={Colors.light.primary} />
              <Text style={styles.uploadButtonText}>Choose Files</Text>
            </TouchableOpacity>
          </View>
        </View>

        {files.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Files to Upload ({files.length})</Text>
            {files.map(file => (
              <View key={file.id} style={styles.fileCard}>
                {file.type === "photo" && (
                  <Image source={{ uri: file.uri }} style={styles.fileThumbnail} />
                )}
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                  <Text style={styles.fileType}>{file.type}</Text>
                  {file.caption && <Text style={styles.fileCaption}>{file.caption}</Text>}
                </View>
                <TouchableOpacity onPress={() => removeFile(file.id)} style={styles.removeButton}>
                  <X size={20} color="#999" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, (uploading || files.length === 0) && styles.submitButtonDisabled]}
          onPress={submitFiles}
          disabled={uploading || files.length === 0}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <CheckCircle size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Submit {files.length} File(s)</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
  typeScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.light.card,
    borderWidth: 2,
    borderColor: Colors.light.primary,
    marginRight: 12,
    gap: 8,
  },
  typeChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  typeChipText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  typeChipTextActive: {
    color: "#fff",
  },
  captionInput: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.light.text,
    minHeight: 80,
    textAlignVertical: "top",
  },
  uploadButtons: {
    flexDirection: "row",
    gap: 12,
  },
  uploadButton: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
    textAlign: "center",
  },
  fileCard: {
    flexDirection: "row",
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
    gap: 12,
  },
  fileThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  fileType: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textTransform: "capitalize",
  },
  fileCaption: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  removeButton: {
    padding: 8,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: Colors.light.card,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  submitButton: {
    flexDirection: "row",
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#fff",
  },
});
