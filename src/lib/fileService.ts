interface FileInfo {
  sourceFile: File;
  sourcePath: string;
  targetPath: string;
}

export async function moveFilesToDirectory(
  files: File[],
  baseDirectory: string
): Promise<void> {
  if (files.length === 0) return;

  try {
    // Get the directory handle from the user
    const dirHandle = await window.showDirectoryPicker({
      mode: "readwrite",
    });

    // Process each file
    for (const file of files) {
      try {
        // Create marked_for_deletion directory if it doesn't exist
        const markedDirHandle = await dirHandle.getDirectoryHandle(
          "marked_for_deletion",
          { create: true }
        );

        // Create a new file in the marked_for_deletion directory
        const newFileHandle = await markedDirHandle.getFileHandle(file.name, {
          create: true,
        });

        // Write the file contents
        const writable = await newFileHandle.createWritable();
        await writable.write(await file.arrayBuffer());
        await writable.close();
      } catch (err) {
        console.error(`Failed to move file ${file.name}:`, err);
        throw err;
      }
    }
  } catch (err) {
    console.error("Failed to move files:", err);
    throw err;
  }
}

export async function deleteFile(
  file: File,
  baseDirectory: string
): Promise<void> {
  try {
    // Get the directory handle from the user
    const dirHandle = await window.showDirectoryPicker({
      mode: "readwrite",
    });

    // Get the file handle from the base directory
    const fileHandle = await dirHandle.getFileHandle(file.name);

    // Remove the file
    await dirHandle.removeEntry(file.name);
  } catch (err) {
    console.error(`Failed to delete file ${file.name}:`, err);
    throw err;
  }
}
