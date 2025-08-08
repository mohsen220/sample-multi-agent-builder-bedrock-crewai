import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { SpaceBetween, Button, Box } from '@cloudscape-design/components';


const ImageViewer = ({ imageFileName, imageData, fileName = 'generated-image' }) => {
    const [isLoading] = useState(false);
    
    // Log image data for debugging (only the first 100 characters)
    console.log('Image data type:', typeof imageData);
    console.log('Image data preview:', imageData ? imageData.substring(0, 100) + '...' : 'No image data');

    // Function to download the image
    const downloadImage = () => {
        try {
            // Create a link element
            const link = document.createElement('a');
            
            // Ensure the image data is properly formatted
            let imageUrl = imageData;
            
            // If it's a base64 string but doesn't have the data URL prefix, add it
            if (imageData.startsWith('data:')) {
                imageUrl = imageData;
            } else if (imageData.startsWith('/9j/')) {
                imageUrl = 'data:image/jpeg;base64,' + imageData;
            } else if (imageData.startsWith('iVBORw0KGgo')) {
                imageUrl = 'data:image/png;base64,' + imageData;
            }
            
            // Set link's href to the image data
            link.href = imageUrl;
            
            // Ensure the filename has an extension
            let downloadFilename = fileName || 'generated-image';
            if (!downloadFilename.endsWith('.png') && !downloadFilename.endsWith('.jpg') && !downloadFilename.endsWith('.jpeg')) {
                downloadFilename += '.png';
            }
            
            // Set the download attribute with the filename
            link.download = downloadFilename;
            
            // Append to the document
            document.body.appendChild(link);
            
            // Trigger the download
            link.click();
            
            // Clean up
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading image:', error);
        }
    };

return (
        <Box>
            <SpaceBetween direction="vertical" size="m">
                <img 
                    src={
                        imageData.startsWith('data:') ? imageData :
                        imageData.startsWith('/9j/') ? 'data:image/jpeg;base64,' + imageData :
                        imageData.startsWith('iVBORw0KGgo') ? 'data:image/png;base64,' + imageData :
                        'data:image/png;base64,' + imageData  // Default to PNG if format can't be determined
                    } 
                    alt="Generated content" 
                    style={{ 
                        maxWidth: '100%', 
                        maxHeight: '500px',
                        border: '1px solid #eee',
                        borderRadius: '4px'
                    }} 
                />
                
                <SpaceBetween direction="horizontal" size="xs">
                    <Button 
                        onClick={downloadImage}
                        loading={isLoading}
                        iconName="download"
                    >
                        Download {imageFileName ? imageFileName.replace(/\.[^/.]+$/, "") : fileName}
                    </Button>
                </SpaceBetween>
            </SpaceBetween>
        </Box>
    );
};

ImageViewer.propTypes = {
  imageFileName: PropTypes.string,
  llmApiUrl: PropTypes.string,
  imageData: PropTypes.string.isRequired,
  fileName: PropTypes.string
};

export default ImageViewer;
