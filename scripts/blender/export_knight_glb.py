import bpy
import sys

# Get output path from args
argv = sys.argv
if "--" not in argv:
    print("Error: No output path provided.")
    sys.exit(1)

output_path = argv[argv.index("--") + 1]

# Ensure mesh and armature are selected/active
bpy.ops.object.select_all(action='DESELECT')
for obj in bpy.context.scene.objects:
    if obj.type in ['MESH', 'ARMATURE']:
        obj.select_set(True)

# Try to push actions to NLA strips if not already there, 
# though glTF exporter handles all actions usually.
# Just to be safe:
armature = None
for obj in bpy.context.selected_objects:
    if obj.type == 'ARMATURE':
        armature = obj
        break

# Export to GLB
bpy.ops.export_scene.gltf(
    filepath=output_path,
    export_format="GLB",
    use_selection=True,
    export_skins=True,
    export_animations=True,
    export_nla_strips=True,
    export_force_sampling=True,
    export_morph=False
)
print(f"Exported successfully to {output_path}")
