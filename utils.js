Dropzone.options.myDropzone = {
    paramName: "file",
    maxFilesize: 10, // MB
    acceptedFiles: "image/jpeg,image/png,image/jpg,image/*",
    init: function() {
        // Handle the paste event
        const dropzoneElement = this.element;

        dropzoneElement.addEventListener('paste', (event) => {
            const items = event.clipboardData.items;

            for (let i = 0; i < items.length; i++) {
                const item = items[i];

                // Check if the pasted item is an image
                if (item.kind === 'file' && item.type.startsWith('image/')) {
                    const file = item.getAsFile();
                    this.addFile(file); // Add the file to Dropzone
                }
            }
        });

        this.on("addedfile", function(file) {
            const reader = new FileReader();
            reader.onloadend = function() {
                // Create and display the modal for the uploaded image
                displayModal(reader.result, file.name);
            }.bind(this);
            reader.readAsDataURL(file);
        });

        this.on("thumbnail", function(file, dataUrl) {
            file.previewElement.addEventListener("click", function() {
                const img = new Image();
                img.src = dataUrl; // Use the generated thumbnail
                img.onload = function() {
                    displayModal(dataUrl, file.name);
                };
            });
        });
    }
};


async function submitPrompt(imageSrc, userPrompt, submitButton, responseTextElement) {
    if (!userPrompt) {
        alert("Please enter a prompt.");
        return;
    }

    const base64Image = imageSrc.split(',')[1];

    const requestBody = {
        messages: [
            {
                role: "system",
                content: "You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. You are to help describe images they provide you with. This may include descriptions of the images or interpretting insights of the images."
            },
            {
                role: "user",
                content: [
                    { type: "text", text: userPrompt },
                    {
                        type: "image_url",
                        image_url: {
                            url: `data:image/jpeg;base64,${base64Image}`,
                            detail: "auto"
                        }
                    }
                ]
            }
        ],
        model: "gpt-4o",
        temperature: 1,
        stream: false,
        max_tokens: 4000
    };

    try {
        submitButton.style.backgroundColor = '#9b59b6'; // Change to purple
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin" style="color: white;"></i>'; // Show spinner

        const response = await fetch("openai_end_point_here", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        const resData = await response.json();
        const outcome = resData.choices[0].message.content;

        submitButton.style.backgroundColor = '';
        submitButton.innerHTML = "Submit";

        var converter = new showdown.Converter(),
        html      = converter.makeHtml(outcome);
        responseTextElement.innerHTML = html; // Set response in the text block
        responseTextElement.style.display = 'block'; // Show the response text

    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while processing the request.");
        submitButton.style.backgroundColor = '';
        submitButton.innerHTML = "Submit";
    }
}

function displayModal(imageSrc, imageName) {
    const rightPanel = document.getElementById("rightPanel");
    const modalContainer = document.createElement("div");
    modalContainer.className = "modal-container";
    modalContainer.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">${imageName}</h5>
                <button class="btn-maximize">&#x26F6;</button>
                <button class="btn-close" id="closeButton">&times;</button>
            </div>
            <div class="modal-body">
                <img src="${imageSrc}" alt="Uploaded Image" id="modalImage">
                <div class="input-container">
                    <form>
                        <div class="input-group mb-3">
                            <input type="text" class="form-control rounded-input" id="inputPrompt" placeholder="Describe this image in two sentences" value="Describe this image in two sentences">
                            <button type="button" class="submit-btn" id="submitButton"> <i class="fas fa-paper-plane"></i> </button>
                        </div>
                        <div class="response-text" id="responseText"></div>
                    </form>
                </div>
            </div>
        </div>
    `;
    rightPanel.insertBefore(modalContainer, rightPanel.lastChild); // Insert modal above footer

    // Add event listener for closing the modal
    const closeButton = modalContainer.querySelector('.btn-close');
    closeButton.addEventListener('click', function() {
        modalContainer.remove(); // Remove the modal from the DOM
        checkModals(); // Check if any modals are left
    });

    // Add event listener for maximizing the modal
    modalContainer.querySelector('.btn-maximize').addEventListener('click', function() {
        const modalContent = modalContainer.querySelector('.modal-content');
        const modalImage = modalContainer.querySelector('#modalImage');

        modalContent.classList.toggle('fullscreen');

        if (modalContent.classList.contains('fullscreen')) {
            // Disable close button when maximized
            closeButton.disabled = true;

            // Hide all other modals
            const modals = document.querySelectorAll('.modal-container');
            modals.forEach(modal => {
                if (modal !== modalContainer) {
                    modal.style.display = 'none'; // Hide other modals
                }
            });

            modalContent.style.margin = '0';
            modalImage.style.maxWidth = '100%'; 
            modalImage.style.maxHeight = '100%'; 
            modalImage.style.margin = "auto";
        } else {
            // Enable close button when not maximized!!!
            closeButton.disabled = false;

            // Show all other modals again
            const modals = document.querySelectorAll('.modal-container');
            modals.forEach(modal => {
                modal.style.display = 'block'; // Show other modals
            });

            modalContent.style.margin = '15px';
            modalImage.style.maxWidth = '100%'; 
            modalImage.style.maxHeight = '200px'; 
            modalImage.style.margin = "";
        }
    });

    // Add event listener for the submit button
    const submitButton = modalContainer.querySelector('#submitButton');
    const responseTextElement = modalContainer.querySelector('#responseText');
    submitButton.addEventListener('click', function() {
        const userPrompt = modalContainer.querySelector('#inputPrompt').value;
        submitPrompt(imageSrc, userPrompt, submitButton, responseTextElement);
    });
}

function checkModals() {
    const modals = document.querySelectorAll('.modal-container');
    if (modals.length === 0) {
    }
}