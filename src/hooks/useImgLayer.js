import mapConstants from '@/constants/map.constants';
import ImageLayer from 'ol/layer/Image';
import Static from 'ol/source/ImageStatic';
import {inject} from "vue";

export function useImgLayer(imgLayer) {
    const map = inject('map')

    const createLayer = (index) => {
        if (imgLayer.value) {
            removeImgLayer();
        }
        const imageLayer = new ImageLayer({
            zIndex: index ?? mapConstants.LAYER_Z_INDEX.CLOUD_ATLAS,
        });
        map.value.addLayer(imageLayer);
        imageLayer.setVisible(true);

        imgLayer.value = imageLayer;
    };

    const removeImgLayer = () => {
        if (map.value && imgLayer.value) {
            map.value.removeLayer(imgLayer.value);
            imgLayer.value = null;
        }
    };

    const setImgLayer = (imageUrl, imageExtent, visible = true) => {
        const extent = imageExtent;
        const projection = 'EPSG:4326';

        const newSource = new Static({
            url: imageUrl,
            projection: projection,
            imageExtent: extent,
        });

        imgLayer.value.setSource(newSource);
        imgLayer.value.setVisible(visible);
        imgLayer.value.setOpacity(0.7);
    };

    const setImgLayerOpacity = (isActive) => {
        if (imgLayer.value) {
            imgLayer.value.setVisible(isActive);
        }
    };
    return {
        createLayer,
        removeImgLayer,
        setImgLayer,
        setImgLayerOpacity,
    };
}
