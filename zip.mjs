// Ett standard-ZIP utan extra npm-paket. Filerna lagras utan komprimering.
// A standard ZIP archive without npm dependencies (stored entries).
import { readdir, readFile, lstat } from "node:fs/promises";
import path from "node:path";

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++)
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export function makeZip(entries) {
  const files = [],
    directory = [];
  let offset = 0;
  for (const entry of entries) {
    const name = Buffer.from(entry.name, "utf8");
    const data = Buffer.isBuffer(entry.content)
      ? entry.content
      : Buffer.from(entry.content, "utf8");
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6); // UTF-8 filenames.
    local.writeUInt16LE(0x21, 12); // 1980-01-01.
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    files.push(local, name, data);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(0x21, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE(offset, 42);
    directory.push(central, name);
    offset += local.length + name.length + data.length;
  }
  const central = Buffer.concat(directory),
    end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(central.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...files, central, end]);
}

export async function submissionZip(root, report, html) {
  const entries = [
    { name: "rapport/resultat.json", content: JSON.stringify(report, null, 2) },
    { name: "rapport/resultat.html", content: html },
    {
      name: "LAS_MIG.txt",
      content:
        "Rapporten finns i rapport/. Elevens sparade kod finns i projekt/.\nPacka upp ZIP-filen, öppna projekt/ i VS Code och kör npm start.\nReports: rapport/. Saved student code: projekt/. Extract, open projekt/ and run npm start.\n",
    },
  ];
  const addFile = async (relative) => {
    const file = path.join(root, relative);
    const info = await lstat(file);
    if (!info.isFile()) return; // Include no symbolic links.
    if (info.size > 5 * 1024 * 1024) throw new Error("PACKAGE_TOO_LARGE");
    entries.push({
      name: "projekt/" + relative.replaceAll(path.sep, "/"),
      content: await readFile(file),
    });
  };
  for (const file of ["package.json", "server.mjs", "zip.mjs", "README.md"])
    await addFile(file);
  const collect = async (relative) => {
    for (const item of await readdir(path.join(root, relative), {
      withFileTypes: true,
    })) {
      if (item.name.startsWith(".")) continue;
      const next = path.join(relative, item.name);
      if (item.isDirectory()) await collect(next);
      else if (item.isFile() && /\.(html|css|js|json|svg)$/i.test(item.name))
        await addFile(next);
    }
  };
  await collect("public");
  if (
    entries.reduce((sum, entry) => sum + Buffer.byteLength(entry.content), 0) >
    10 * 1024 * 1024
  )
    throw new Error("PACKAGE_TOO_LARGE");
  return makeZip(entries);
}
