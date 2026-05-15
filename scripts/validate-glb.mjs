import { NodeIO } from '@gltf-transform/core';
import fs from 'fs';
import path from 'path';

// This is required to read standard glTF files
const io = new NodeIO();

async function run() {
    const file = process.argv[2];
    if (!file) {
        console.error("Usage: node scripts/validate-glb.mjs <path-to-glb>");
        process.exit(1);
    }

    try {
        const doc = await io.read(file);
        const root = doc.getRoot();

        const nodes = root.listNodes().length;
        const meshes = root.listMeshes().length;
        const skins = root.listSkins().length;
        const animations = root.listAnimations();
        const animationNames = animations.map(a => a.getName());

        console.log(`nodes: ${nodes}`);
        console.log(`meshes: ${meshes}`);
        console.log(`skins: ${skins}`);
        console.log(`animations: ${animations.length}`);
        console.log(`animationNames: ${animationNames.join(', ')}`);
        
        if (skins === 0 || animations.length === 0) {
            console.error("\n❌ Validation Failed: Missing skins or animations.");
            process.exit(1);
        } else {
            console.log("\n✅ Validation Passed: File has skins and animations.");
        }
    } catch (e) {
        console.error("Error reading GLB:", e);
        process.exit(1);
    }
}

run();
