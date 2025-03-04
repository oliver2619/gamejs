export type PathArcJson = ['arc', number, number, number, number, number];
export type PathBezierJson = ['bezier', number, number, number, number, number, number];
export type PathBoneJson = ['bone', number, number, number, boolean, number, number, number, boolean];
export type PathCircleJson = ['circle', number, number, number];
export type PathCloseJson = ['close'];
export type PathEllipseJson = ['ellipse', number, number, number, number, number];
export type PathMoveJson = ['move', number, number];
export type PathLineJson = ['line', number, number];
export type PathPolygonJson = ['polygon', Array<[number, number]>];
export type PathPolylineJson = ['polyline', Array<[number, number]>];
export type PathQuadraticJson = ['quadratic', number, number, number, number];
export type PathRectJson = ['rect', number, number, number, number];

export type PathJson = PathArcJson | PathBezierJson | PathBoneJson | PathCircleJson | PathCloseJson | PathEllipseJson | PathMoveJson
    | PathLineJson | PathPolygonJson | PathPolylineJson | PathQuadraticJson | PathRectJson;
