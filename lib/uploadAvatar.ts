export default async function uploadAvatar(file) {
  try {
    const preSignedUrl = await fetch(
      `/api/user-avatar-upload?filename=${file.name}&type=${file.type}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    const { url } = await preSignedUrl.json();
    const response = await fetch(url, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to upload avatar");
    }
    

    console.log(response);
  } catch (err) {}
}
