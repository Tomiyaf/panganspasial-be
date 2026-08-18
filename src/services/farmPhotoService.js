import fs from "fs";
import path from "path";
import prisma from "../lib/prisma.js";

export class FarmPhotoService {
  static async getPhotosByFarm(farmId) {
    return prisma.farmPhoto.findMany({
      where: { farm_id: BigInt(farmId) },
      orderBy: [{ is_primary: "desc" }, { sort_order: "asc" }],
    });
  }

  static async addPhoto(farmId, file, { caption = "", is_primary = false, sort_order = 0 } = {}) {
    // Validate farm exists
    const farm = await prisma.farm.findUnique({ where: { id: BigInt(farmId) } });
    if (!farm) {
      // Clean up uploaded file if farm doesn't exist
      if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
      const err = new Error("Farm not found");
      err.status = 404;
      throw err;
    }

    const isPrimaryBool = is_primary === "true" || is_primary === true;
    const sortOrderNum = parseInt(sort_order, 10) || 0;
    const relativeFilePath = `/uploads/farms/${file.filename}`;

    // If marked as primary, unset other photos for this farm
    if (isPrimaryBool) {
      await prisma.farmPhoto.updateMany({
        where: { farm_id: BigInt(farmId) },
        data: { is_primary: false },
      });
    }

    return prisma.farmPhoto.create({
      data: {
        farm_id: BigInt(farmId),
        file_path: relativeFilePath,
        caption,
        is_primary: isPrimaryBool,
        sort_order: sortOrderNum,
      },
    });
  }

  static async updatePhoto(id, { caption, is_primary, sort_order }) {
    const photo = await prisma.farmPhoto.findUnique({ where: { id: BigInt(id) } });
    if (!photo) {
      const err = new Error("Photo not found");
      err.status = 404;
      throw err;
    }

    const isPrimaryBool = is_primary !== undefined ? (is_primary === "true" || is_primary === true) : photo.is_primary;

    if (isPrimaryBool && !photo.is_primary) {
      await prisma.farmPhoto.updateMany({
        where: { farm_id: photo.farm_id },
        data: { is_primary: false },
      });
    }

    return prisma.farmPhoto.update({
      where: { id: BigInt(id) },
      data: {
        ...(caption !== undefined && { caption }),
        ...(is_primary !== undefined && { is_primary: isPrimaryBool }),
        ...(sort_order !== undefined && { sort_order: parseInt(sort_order, 10) || 0 }),
      },
    });
  }

  static async deletePhoto(id) {
    const photo = await prisma.farmPhoto.findUnique({ where: { id: BigInt(id) } });
    if (!photo) {
      const err = new Error("Photo not found");
      err.status = 404;
      throw err;
    }

    // Delete record
    await prisma.farmPhoto.delete({ where: { id: BigInt(id) } });

    // Clean up physical file on disk
    try {
      const fullPath = path.resolve(process.cwd(), "public", photo.file_path.replace(/^\//, ""));
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (e) {
      console.warn("Failed to delete physical photo file:", e.message);
    }

    return true;
  }
}

export default FarmPhotoService;
