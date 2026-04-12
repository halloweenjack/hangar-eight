mapboxgl.accessToken = 'pk.eyJ1IjoiaGFsbG93ZWVuamFjayIsImEiOiJjazFoOHI4dHAwOXR6M21ucjc5bzBndDVqIn0.OgSEffoZwfR5b2-9QmcQKA';
(async () => {
    // Marker coordinates
    const marker1Coords = [139.95629641305882, 35.14061783497158];
    const marker2Coords = [139.96578460096433, 35.134990429997345];

    // Calculate midpoint
    const centerCoords = [
        (marker1Coords[0] + marker2Coords[0]) / 2,
        (marker1Coords[1] + marker2Coords[1]) / 2
    ];

    const map = new mapboxgl.Map({
        container: 'map',
        zoom: 14.5,
        center: centerCoords, // Use the calculated midpoint as center
        pitch: 60,
        bearing: 100,
        interactive: false,
        style: 'mapbox://styles/mapbox/satellite-v9'
    });

    map.addControl(new mapboxgl.NavigationControl());

    await map.once('style.load');

    // Add 3D terrain
    map.addSource('mapbox-dem', {
        'type': 'raster-dem',
        'url': 'mapbox://mapbox.terrain-rgb',
        'tileSize': 512,
        'maxzoom': 14
    });
    map.setTerrain({
        'source': 'mapbox-dem',
        'exaggeration': 1.5
    });

    // Run a timing loop to switch between day and night
    await map.once('idle');

    let lastTime = 0.0;
    let animationTime = 0.0;
    let animationFrameId;
    const initialBearing = map.getBearing();
    const initialZoom = map.getZoom();
    const initialPitch = map.getPitch();
    const initialCenter = map.getCenter();
    let isRotating = true;
    let isSatellite = true; // Flag to track current style

    // Marker 1
    const popup1 = new mapboxgl.Popup({ closeOnClick: false })
        .setHTML('<h3>Hangar eight</h3><h3>Espace Hangar</h3><h3>Camp david</h3>');

    const marker1 = new mapboxgl.Marker()
        .setLngLat(marker1Coords)
        .setPopup(popup1)
        .addTo(map);

    // Marker 2
    const popup2 = new mapboxgl.Popup({ closeOnClick: false })
        .setHTML('<h3>Automobile club de Monaca</h3><h3>Studio Kougai</h3><h3>atelier SiFo</h3>');

 const marker2 = new mapboxgl.Marker()
        .setLngLat(marker2Coords)
        .setPopup(popup2)
        .addTo(map);

    function frame(time) {
        const elapsedTime = (time - lastTime) / 1000.0;

        animationTime += elapsedTime;

        const rotation = initialBearing + animationTime * 2.0;
        map.setBearing(rotation % 360);

        lastTime = time;

        animationFrameId = window.requestAnimationFrame(frame);
    }

    animationFrameId = window.requestAnimationFrame(frame);

    document.getElementById('toggleRotationButton').addEventListener('click', () => {
        if (isRotating) {
            // Stop rotation
            window.cancelAnimationFrame(animationFrameId);

            // Enable map interaction
            map.dragPan.enable();
            map.scrollZoom.enable();
            map.doubleClickZoom.enable();
            map.touchZoomRotate.enable();
            map.dragRotate.enable();
            map.touchZoomRotate.enableRotation();

            // Update button text
            document.getElementById('toggleRotationButton').textContent = 'Start Rotation';
        } else {
            // Disable map interaction
            map.dragPan.disable();
            map.scrollZoom.disable();
            map.doubleClickZoom.disable();
            map.touchZoomRotate.disable();
            map.dragRotate.disable();
            map.touchZoomRotate.disableRotation();

            // Restart rotation
            lastTime = 0.0;
            animationTime = 0.0;
            animationFrameId = window.requestAnimationFrame(frame);

            // Update button text
            document.getElementById('toggleRotationButton').textContent = 'Stop Rotation';
        }
        isRotating = !isRotating;
    });

    document.getElementById('resetMapButton').addEventListener('click', () => {
        // Reset map to initial position without animation
        map.jumpTo({
            center: initialCenter,
            zoom: initialZoom,
            bearing: initialBearing,
            pitch: initialPitch
        });

        if (!isRotating) {
            // Disable map interaction if rotation was stopped
            map.dragPan.disable();
            map.scrollZoom.disable();
            map.doubleClickZoom.disable();
            map.touchZoomRotate.disable();
            map.dragRotate.disable();
            map.touchZoomRotate.disableRotation();

            // Restart rotation
            lastTime = 0.0;
            animationTime = 0.0;
            animationFrameId = window.requestAnimationFrame(frame);

            // Update rotation button text
            document.getElementById('toggleRotationButton').textContent = 'Stop Rotation';
            isRotating = true;
        }
    });

    document.getElementById('toggleStyleButton').addEventListener('click', () => {
        if (isSatellite) {
            map.setStyle('mapbox://styles/mapbox/streets-v11');
        } else {
            map.setStyle('mapbox://styles/mapbox/satellite-v9');
        }
        isSatellite = !isSatellite;
    });
})();