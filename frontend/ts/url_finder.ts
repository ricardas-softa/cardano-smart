import { walk } from "https://deno.land/std/fs/mod.ts";

async function findFile(rootDir: string, filename: string): Promise<string | null> {
  for await (const entry of walk(rootDir)) {
    if (entry.isFile && entry.name === filename) {
      return entry.path;
    }
  }
  return null;
}

async function getUrlFromFile(filePath: string): Promise<string | null> {
  try {
    const fileContent = await Deno.readTextFile(filePath);
    const lines = fileContent.split('\n');
    if (lines.length >= 3) {
      const urlLine = lines[2].trim();
      if (urlLine.startsWith("URL: ")) {
        return urlLine.slice(5);  // Return everything after "URL: "
      }
    }
  } catch (error) {
    console.error("Error reading file:", error);
  }
  return null;
}

export async function getUrlForFilename(rootDir: string, filename: string): Promise<string> {
  const filePath = await findFile(rootDir, filename);
  if (filePath) {
    const url = await getUrlFromFile(filePath);
    if (url) {
      return url;
    } else {
      return "URL not found in the file";
    }
  } else {
    return "File not found";
  }
}
