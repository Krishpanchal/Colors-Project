//Global Variables and selectors
const divColors = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate");
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll(".color h2");
const popup = document.querySelector(".copy-container");
const popupBox = document.querySelector('.copy-popup');
const adjustButton = document.querySelectorAll(".adjust");
const closeAdjustments = document.querySelectorAll(".close-adjustment");
const sliderContainers = document.querySelectorAll(".sliders");
const lockButton = document.querySelectorAll(".lock");
let initialColors;
let savePalettes = [];


//Event Listeners
generateBtn.addEventListener("click" , randomColors);
sliders.forEach(slider => {
    slider.addEventListener('input' , hslControls);
});

divColors.forEach((div , index) => {
    div.addEventListener('input' , () => {
        updateTextUI(index);
    });
});

currentHexes.forEach(hex => {
    hex.addEventListener('click' , () => {
        copyToClipbroad(hex);
    });
});

popup.addEventListener('transitionend' , () => {
    popup.classList.remove("active");
    popupBox.classList.remove("active");
});

adjustButton.forEach((adjust , index) => {
    adjust.addEventListener("click" , () => {
        openAdjustmentPanel(index);
    });
});

closeAdjustments.forEach((close , index) => {
    close.addEventListener("click" , () => {
        closeAdjustmentPanel(index);
    });
});

lockButton.forEach( (lock,index) => {
    
    lock.addEventListener("click" , () => {
        console.log(divColors[index]);
        if(lock.children[0].classList.contains("fa-lock-open")){
            lock.children[0].classList.remove("fa-lock-open");
            lock.children[0].classList.add("fa-lock");
            divColors[index].classList.add("locked");
        }else {
            lock.children[0].classList.add("fa-lock-open");
            lock.children[0].classList.remove("fa-lock");
            divColors[index].classList.remove("locked");
        }
    })
});






//Fucntions
//Getting random text
function generateHex(){
    const hexColor = chroma.random();
    return hexColor;
}

//Generating random color
function randomColors(){

    initialColors = [];

    divColors.forEach((div , index)=>{
        const hexText = div.children[0];
        const randomColor = generateHex();

        if(div.classList.contains("locked")){
            initialColors.push(hexText.innerText);
            return;
        }else{
        initialColors.push(chroma(randomColor).hex());
        }

        div.style.backgroundColor = randomColor;
        hexText.innerText = randomColor;

        //check the contrast
        checkTextContrast(randomColor , hexText);

        //Initial colorize sliders
        const color = chroma(randomColor);
        const sliders = div.querySelectorAll(".sliders input");
        const hue = sliders[0];
        const brightness = sliders[1];
        const saturation = sliders[2];

        colorsizeSliders(color, hue , brightness , saturation);
    
    });

    resetInput();

    adjustButton.forEach((button , index) => {
        checkTextContrast(initialColors[index] , button);
        checkTextContrast(initialColors[index] , lockButton[index]);
    })
}

function checkTextContrast(color,text){
    const luminance = chroma(color).luminance();
    if(luminance > 0.5)
        text.style.color = "black";
    else    
        text.style.color = "white";        
}

//Colorize Sldiers
function colorsizeSliders(color, hue , brightness , saturation){

    //Scale saturation
    const noSat = color.set("hsl.s" , 0);
    const fullSat = color.set("hsl.s" , 1);
    const scaleSat = chroma.scale([noSat , color , fullSat]);

    //scale birghtness
    const midBright = color.set("hsl.l", 0.5);
    const scaleBright = chroma.scale(["black" , midBright , "white"]);


    saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSat(0)} , ${scaleSat(1)})`;
    brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBright(0)} , ${scaleBright(0.5)},  ${scaleBright(1)})`;
    hue.style.backgroundImage = 'linear-gradient(to right, rgb(204 , 75 , 75) , rgb(204 , 204 , 75) , rgb(75,204,75) , rgb(75,204,204) , rgb(75,75,204) ,rgb(204,75,204) , rgb(204,75,75))';
}


function hslControls(e){
    const index = e.target.getAttribute("data-bright") || e.target.getAttribute("data-hue") || e.target.getAttribute("data-sat");
    
    let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    const bgColor = initialColors[index];

    let color = chroma(bgColor).set("hsl.s",saturation.value).set("hsl.l" , brightness.value).set("hsl.h",hue.value);

    divColors[index].style.backgroundColor = color;

    colorsizeSliders(color, hue , brightness , saturation);
}

function updateTextUI(index){
    const activeDiv = divColors[index];
    const color = chroma(activeDiv.style.backgroundColor);
    const textHex = activeDiv.querySelector('h2');
    const icons  = activeDiv.querySelectorAll(".controls button");  
    textHex.innerText = color.hex();

    checkTextContrast(color , textHex);

    for (icon of icons){
        checkTextContrast(color, icon);
    }

}

function resetInput(){
     const sliders = document.querySelectorAll(".sliders input");
     sliders.forEach(slider => {
            if(slider.name === 'hue'){
                const hueColor = initialColors[slider.getAttribute('data-hue')];
                const hueValue = chroma(hueColor).hsl()[0];
                slider.value = Math.floor(hueValue);
            }
     });

     sliders.forEach(slider => {
        if(slider.name === 'brightness'){
            const brightColor = initialColors[slider.getAttribute('data-bright')];
            const brightValue = chroma(brightColor).hsl()[2];
            slider.value = Math.floor(brightValue * 100) / 100;
        }
 });

 sliders.forEach(slider => {
    if(slider.name === 'saturation'){
        const satColor = initialColors[slider.getAttribute('data-sat')];
        const satValue = chroma(satColor).hsl()[1];
            slider.value = Math.floor(satValue * 100) / 100;
    }
});
}

function copyToClipbroad(hex){
    const el =  document.createElement("textarea");
    el.value = hex.innerText;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);


    popup.classList.add("active");
    popupBox.classList.add("active");
}

function openAdjustmentPanel(index){
    sliderContainers[index].classList.toggle("active");
}

function closeAdjustmentPanel(index){
    sliderContainers[index].classList.remove("active");
}

//
//
//
//
// Implement save to palette and local Storage

const saveBtn = document.querySelector(".save");
const submitSave = document.querySelector(".submit-save");
const closeSave = document.querySelector(".close-save");
const saveContainer = document.querySelector(".save-container");
const saveInput = document.querySelector(".save-container input");
const libraryContainer = document.querySelector(".library-container");
const libraryBtn = document.querySelector(".library");
const closeLibraryBtn = document.querySelector(".close-library");
const savePopup = saveContainer.children[0];


saveBtn.addEventListener("click" , openPalette);
closeSave.addEventListener("click" , closePalette);
submitSave.addEventListener("click" , savePalette);
libraryBtn.addEventListener("click" , openLibrary);
closeLibraryBtn.addEventListener("click" , closeLibrary);



function openPalette(e){
    saveContainer.classList.add("active");
    savePopup.classList.add("active");
}

function closePalette(e){
    saveContainer.classList.remove("active");
    savePopup.classList.remove("active");
}

function savePalette(){
    saveContainer.classList.remove("active");
    savePopup.classList.remove("active");

    const name = saveInput.value;
    const colors = [];

    currentHexes.forEach(hex => {
        colors.push(hex.innerText);
    });

    
    
    let paletteNr;
    const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
    if(paletteObjects){
        paletteNr = paletteObjects.length;
    }else{
        paletteNr = savePalettes.length;
    }


    const paletteObj = { name, colors , nr: paletteNr};
    savePalettes.push(paletteObj);
    savetoLocal(paletteObj);
    saveInput.value = "";


    //Generate the palette for library
    const palette = document.createElement("div");
    palette.classList.add("custom-palette");
    const title = document.createElement("h4");
    title.innerText = paletteObj.name;

    const preview = document.createElement("div");
    preview.classList.add("small-preview");
    paletteObj.colors.forEach(smallColor => {
        const smallDiv = document.createElement("div");
        smallDiv.style.background = smallColor;
        preview.appendChild(smallDiv);
    });
    const paletteBtn = document.createElement("button");
    paletteBtn.classList.add("pick-palette-btn");
    paletteBtn.classList.add(paletteObj.nr);
    paletteBtn.innerText = "Select";

    paletteBtn.addEventListener("click" , e => {
        closeLibrary();
        const paletteIndex = e.target.classList[1];
        initialColors = [];
        savePalettes[paletteIndex].colors.forEach((color , index)=>{
            initialColors.push(color);
            divColors[index].style.backgroundColor = color;
            const text = divColors[index].children[0];
            checkTextContrast(color , text);
            updateTextUI(index);
        });
        resetInput();
    });


    palette.append(title);
    palette.append(preview);
    palette.append(paletteBtn);
    libraryContainer.children[0].appendChild(palette);
}

function savetoLocal(paletteObj){
    let localPalletes;

    if(localStorage.getItem("palettes") === null){
        localPalletes = [];
    }else{
        localPalletes = JSON.parse(localStorage.getItem("palettes"));
    }

    localPalletes.push(paletteObj);
    localStorage.setItem("palettes" ,JSON.stringify(localPalletes));
}

function openLibrary(){
    const popup = libraryContainer.children[0];
    libraryContainer.classList.add("active");
    popup.classList.add("active");
}

function closeLibrary(){
    const popup = libraryContainer.children[0];
    libraryContainer.classList.remove("active");
    popup.classList.remove("active");
}

function getLocal(){
    if(localStorage.getItem("palettes") === null){
        localStorage = [];
    }else{
        const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
        
        savePalettes = [...paletteObjects];
        paletteObjects.forEach(paletteObj => {

            const palette = document.createElement("div");
            palette.classList.add("custom-palette");
            const title = document.createElement("h4");
            title.innerText = paletteObj.name;
        
            const preview = document.createElement("div");
            preview.classList.add("small-preview");
            paletteObj.colors.forEach(smallColor => {
                const smallDiv = document.createElement("div");
                smallDiv.style.background = smallColor;
                preview.appendChild(smallDiv);
            });
            const paletteBtn = document.createElement("button");
            paletteBtn.classList.add("pick-palette-btn");
            paletteBtn.classList.add(paletteObj.nr);
            paletteBtn.innerText = "Select";
        
            paletteBtn.addEventListener("click" , e => {
                closeLibrary();
                const paletteIndex = e.target.classList[1];
                initialColors = [];
                paletteObjects[paletteIndex].colors.forEach((color , index)=>{
                    initialColors.push(color);
                    divColors[index].style.backgroundColor = color;
                    const text = divColors[index].children[0];
                    checkTextContrast(color , text);
                    updateTextUI(index);
                });
                resetInput();
            });
        
        
            palette.append(title);
            palette.append(preview);
            palette.append(paletteBtn);
            libraryContainer.children[0].appendChild(palette);
        });
    }
}

getLocal();
randomColors();
