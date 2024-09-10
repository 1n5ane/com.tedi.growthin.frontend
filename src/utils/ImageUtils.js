export default class ImageUtils {

    static async getImageDataUrl(imagePath) {
        try {
            // Fetch the image from the path
            const response = await fetch(imagePath);
            const blob = await response.blob();

            // Create a URL for the blob
            const imageUrl = URL.createObjectURL(blob);

            // Create an image element
            const img = new Image();
            img.src = imageUrl;

            // Wait for the image to load
            await new Promise((resolve) => {
                img.onload = resolve;
            });

            // Create a canvas element
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw the image on the canvas
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            // Get the data URL from the canvas
            const dataUrl = canvas.toDataURL();

            // Clean up
            URL.revokeObjectURL(imageUrl);

            return dataUrl;
        } catch (error) {
            console.error('Error getting image data URL:', error);
            return null;
        }
    };

    static extractTypeAndBase64Data(imageData) {
        const indexStart = imageData.indexOf('data:')
        const indexEnd = imageData.indexOf(';')
        const type = imageData.substring(indexStart + 'data:'.length, indexEnd);
        const base64Data = imageData.substring(imageData.indexOf(',')+1,imageData.length);
        return {type, base64Data}
    }

    static constructBase64ImageFromTypeAndBase64Data(base64ImageData, type) {
        //type should be for ex.'image/png'
        return `data:${type};base64,${base64ImageData}`.toString();
    }

}