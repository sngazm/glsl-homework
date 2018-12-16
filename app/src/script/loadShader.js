export default function loadShader(vertex_url, fragment_url, onLoad, onProgress, onError) {
    const vertex_loader = new THREE.XHRLoader(THREE.DefaultLoadingManager);
    vertex_loader.setResponseType('text');
    vertex_loader.load(vertex_url, function (vertex_text) {
        const fragment_loader = new THREE.XHRLoader(THREE.DefaultLoadingManager);
        fragment_loader.setResponseType('text');
        fragment_loader.load(fragment_url, function (fragment_text) {
            onLoad(vertex_text, fragment_text);
        });
    }, onProgress, onError);
}