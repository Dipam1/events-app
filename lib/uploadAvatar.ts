interface UploadResponse {
  url: string;
  cleanUrl: string;
  contentType?: string;
}

/**
 * Uploads an avatar file to S3 and saves the URL to the user profile
 * @param file - The image file to upload
 * @returns true if upload was successful, false otherwise
 */
export default async function uploadAvatar(file: File): Promise<boolean> {
  try {
    // Step 1: Get presigned URL from backend
    const filename = encodeURIComponent(file.name);
    const type = encodeURIComponent(file.type || "");

    const preSignedRes = await fetch(
      `/api/user-avatar-upload?filename=${filename}&type=${type}`,
    );

    if (!preSignedRes.ok) {
      throw new Error(`Failed to get signed URL: ${await preSignedRes.text()}`);
    }

    const { url, cleanUrl } = (await preSignedRes.json()) as UploadResponse;

    // Step 2: Upload file to S3 using presigned URL
    const uploadRes = await fetch(url, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type || "application/octet-stream",
      },
    });

    if (!uploadRes.ok) {
      throw new Error(
        `S3 upload failed: ${uploadRes.status} ${await uploadRes.text()}`,
      );
    }

    // Step 3: Confirm upload and save URL to DB
    const confirmRes = await fetch(
      `/api/user-avatar-upload/confirm-upload?url=${encodeURIComponent(cleanUrl)}`,
    );

    if (!confirmRes.ok) {
      throw new Error(`Failed to confirm upload: ${await confirmRes.text()}`);
    }

    return true;
  } catch (err) {
    console.error("Avatar upload error:", err);
    return false;
  }
}
