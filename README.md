# gamejs

## Core

* Math
    * Matrix4?

## 3d

* rendertotexture: multiple color targets only for webgl2
* render viewports -> viewports change -> clear caches?
* what if the viewport changes only a bit and caches dont need to be cleared?

### mesh
  * geometry-mesh-builder
  * geometry-mesh-lod-builder
  * lod solid & builder
  * mesh builder
  * transparent mesh & builder

* deferred rendering pipeline
* scene
* shader
* texture3d
* vertexarraybuilder
* light
* background
* fog
* camera

## 2d

### Todo

* All object-2d-parts: clone does not clone occlusion-test.
* SVG parser concept overworking
- physics engine
  - collision 2 dynamic objects
  - collision dynamic bounding box
  - collision dynamic polygon
  - collision & intrusion -> real physical spring model
  - static polygon & static line segment => reuse point and line segment collision testing
  - constraints effecting rotation

- bones & bone animation
- svg loader
  - arcs
  - symbol, use, defs, text, filter, composite, clip
- interaction ranges, physical system?: obj1 adds interaction sphere / box. interaction range enumerates all other objects.

 ### Maybe

- quadtree, octtree: rebuild heterogen (divide as required and not at center)
- object / solid builder
- solid, buffered layer: shadow

## Showcase
