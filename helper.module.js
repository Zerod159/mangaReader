export class Helper{
    constructor(){
        this.imageDrawingParams={}
    }


    async  addImageProcess(src){
        return new Promise((resolve, reject) => {
            let img = new Image()
            img.onload = () => resolve(img)
            img.onerror = reject
            img.src = src
        })
    }

    async  resizeImage(image, width, height) {
        return new Promise((resolve, reject) => {
            // Erstellen eines Canvas-Elements
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            // Zeichnen des Bildes auf das Canvas in der neuen Größe
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0, width, height);

            // Erstellen eines neuen Image-Objekts mit der skalierten Version
            const resizedImage = new Image();
            resizedImage.onload = () => resolve(resizedImage);
            resizedImage.onerror = reject;
            resizedImage.src = canvas.toDataURL(); // Bild in Data URL konvertieren
        });
    }


     imageToImageData(image) {
        // Erstellen eines Canvas-Elements mit der Größe des Bildes
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;

        // Zeichnen des Bildes auf das Canvas
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);

        // Abrufen der ImageData des gesamten Canvas
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        return imageData;
    }

     drawBoundingBoxes(ctx,boxes,offsetX,offsetY,scaleX,scaleY) {
        ctx.strokeStyle = 'red'; // Randfarbe der Bounding Box
        ctx.lineWidth = 2;
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = 'red';

        boxes.forEach(box => {
            const [x, y, w, h] = box.bounding;
            // Skaliere und verschiebe die Box auf das zentrierte Bild
            const scaledX = offsetX + x * scaleX;
            const scaledY = offsetY + y * scaleY;
            const scaledW = w * scaleX;
            const scaledH = h * scaleY;

            // Zeichne das Rechteck
            ctx.strokeRect(scaledX, scaledY, scaledW, scaledH);

            // Zeichne das Label und die Wahrscheinlichkeit
            let  labelText = `${box.label} (${(box.probability * 100).toFixed(1)}%)`;

            if(box.orderID !== undefined)
                labelText = `Order:${box.orderID}`;

            ctx.fillText(labelText, scaledX, scaledY +20);
        });
    }


    drawBoundingBoxesTbs(ctx,boxes,offsetX,offsetY,scaleX,scaleY) {
        ctx.strokeStyle = 'red'; // Randfarbe der Bounding Box
        ctx.lineWidth = 2;
        //ctx.font = 'bold 24px Arial';
        //ctx.fillStyle = 'red';

        let index = 0;
        boxes.forEach(box => {
            const [x, y, w, h] = box.b;
            // Skaliere und verschiebe die Box auf das zentrierte Bild
            const scaledX = offsetX + x * scaleX;
            const scaledY = offsetY + y * scaleY;
            const scaledW = w * scaleX;
            const scaledH = h * scaleY;

            // Zeichne das Rechteck
            ctx.strokeRect(scaledX, scaledY, scaledW, scaledH);

            // Zeichne das Label und die Wahrscheinlichkeit
            
             //let labelText = `Order:${index}`;
             //index++;

            //ctx.fillText(labelText, scaledX, scaledY +20);
        });
    }

     categorizeBoxes(boxes,catProperty) {
        const categorized = {};

        boxes.forEach(box => {
            // Falls die Kategorie (Label) noch nicht existiert, ein neues Array erstellen
            if (!categorized[box[catProperty]]) {
                categorized[box[catProperty]] = [];
            }
            // Füge die Box der entsprechenden Kategorie hinzu
            categorized[box[catProperty]].push(box);
        });

        return categorized;
    }

     pointToLineDistance(point, lineStart, lineEnd) {
        const [px, py] = point;          // Koordinaten des Punktes
        const [x1, y1] = lineStart;      // Startpunkt der Linie
        const [x2, y2] = lineEnd;        // Endpunkt der Linie

        // Berechnung der Parameter der Linie
        const A = y2 - y1;               // Unterschied der y-Koordinaten
        const B = x1 - x2;               // Unterschied der x-Koordinaten
        const C = x2 * y1 - x1 * y2;     // Konstante für die Geradengleichung

        // Berechnung der Distanz
        const distance = Math.abs(A * px + B * py + C) / Math.sqrt(A * A + B * B);
        
        return distance;
    }

   
    // Setze Canvas Größe beim Laden und bei Fenstergrößenänderung
     resizeCanvas(canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }


    // Zeichnet ein Bild genau mittig und maximal groß im Canvas
    async  drawImageCentered(image,canvas,ctx) {
        //const image = await loadImage(src);

        // Berechne die Skalierung, um das Bild maximal groß zu machen
        const canvasAspect = canvas.width / canvas.height;
        const imageAspect = image.width / image.height;

        let drawWidth, drawHeight;

        if (imageAspect > canvasAspect) {
            // Bild ist breiter als Canvas
            drawWidth = canvas.width;
            drawHeight = canvas.width / imageAspect;
        } else {
            // Bild ist höher als Canvas
            drawWidth = canvas.height * imageAspect;
            drawHeight = canvas.height;
        }

        // Berechne die Position für zentriertes Zeichnen
        const offsetX = (canvas.width - drawWidth) / 2;
        const offsetY = (canvas.height - drawHeight) / 2;

        // Löscht das Canvas und zeichnet das Bild neu
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);

        let imageDrawingParams = {}
        imageDrawingParams.offsetX = offsetX;
        imageDrawingParams.offsetY = offsetY;
        imageDrawingParams.drawWidthRatio = drawWidth / image.width;
        imageDrawingParams.drawHeightRatio = drawHeight/ image.height;
        return imageDrawingParams;
      }

       calculateIntersectionArea(box1, box2) {
        const x1 = Math.max(box1[0], box2[0]);
        const y1 = Math.max(box1[1], box2[1]);
        const x2 = Math.min(box1[0] + box1[2], box2[0] + box2[2]);
        const y2 = Math.min(box1[1] + box1[3], box2[1] + box2[3]);

        const width = Math.max(0, x2 - x1);
        const height = Math.max(0, y2 - y1);

        return width * height;
    }
    sortBBs(bbs,imageOri){
        for(let i = 0; i < bbs.length; i++) {
            let bb = bbs[i];
            let upper = bb.bounding[1]
            let right = bb.bounding[0]+bb.bounding[2]

            let dist = Math.round( this.pointToLineDistance([upper,right],[0,imageOri.width],[10,imageOri.width+20]))
            bb.order =  dist
            //bb.label = dist
        }
       
        return bbs.sort((a, b) => a.order - b.order);
    }


    assignTbsToPanels(panels, tbs) {
        tbs.forEach(tb => {
            let maxIntersectionArea = 0;
            let bestPanel = null;

            // Suche das Panel mit der größten Schnittfläche
            panels.forEach(panel => {
            const intersectionArea = this.calculateIntersectionArea(panel.bounding, tb.bounding);

            // Wenn die Schnittfläche größer ist, aktualisiere das beste Panel
            if (intersectionArea > maxIntersectionArea) {
                maxIntersectionArea = intersectionArea;
                bestPanel = panel;
            }
            });

            // Wenn ein passendes Panel gefunden wurde, weise die tb zu
            if (bestPanel) {
            // Speichere die Panel-ID im tb-Objekt
                tb.panelId = bestPanel.id;

                // Füge die tb zum Array der zugewiesenen tbs im Panel hinzu
                if(!bestPanel.assignedTbs) bestPanel.assignedTbs = [];

                bestPanel.assignedTbs.push(tb);
            }
        });

        return [panels, tbs]
    }

    async  hashImageData(imageData) {
        // Konvertiere die ImageData-Daten (Uint8ClampedArray) in ein ArrayBuffer
        //const buffer = imageData.data.buffer;

        // Erstelle einen ArrayBuffer von der Uint8ClampedArray-Daten
        //const uint8Array = new Uint8Array(buffer);

        // Erstelle einen Hash der Daten
        //const hashBuffer = await crypto.subtle.digest('SHA-256', uint8Array);


        //const dataAsString = String.fromCharCode.apply(null, uint8Array);
        //const hashBuffer = sha256(dataAsString);

        let dataString = '';
        for (let i = 0; i < imageData.data.length; i++) {
            dataString += String.fromCharCode(imageData.data[i]);
        }
        const hashBuffer = sha256(dataString);
        return hashBuffer
        //const hashHex = hashBuffer.map(byte => byte.toString(16).padStart(2, '0')).join('');
        // Konvertiere den Hash in einen Hex-String
        //const hashArray = Array.from(new Uint8Array(hashBuffer));
        //const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

        //return hashHex;
    }


    cropImage(image, bounding) {
        return new Promise((resolve, reject) => {
            // Erstelle ein temporäres Canvas-Element
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            // Setze die Größe des Canvas auf die Größe des Bildes
            canvas.width = image.width;
            canvas.height = image.height;

            // Zeichne das Bild auf das Canvas
            context.drawImage(image, 0, 0);

            // Iteriere über alle Bounding-Boxen und schneide die Bereiche aus
            const croppedImages = bounding.map(box => {
            const [x, y, w, h] = box.bounding;
            
            // Setze die Größe des Canvas auf die Größe der zu schneidenden Box
            const cropCanvas = document.createElement('canvas');
            const cropContext = cropCanvas.getContext('2d');
            cropCanvas.width = w;
            cropCanvas.height = h;

            cropCanvas.boxId = box.id
            
            // Zeichne den ausgeschnittenen Bereich auf das neue Canvas
            cropContext.drawImage(
                canvas,          // Die gesamte Bildfläche auf dem Haupt-Canvas
                x, y,            // Die obere linke Ecke des Ausschnitts auf dem Haupt-Canvas
                w, h,            // Breite und Höhe des Ausschnitts
                0, 0,            // Die obere linke Ecke des neuen Canvas
                w, h             // Breite und Höhe des neuen Canvas
            );
            
            // Hole die ImageData des zugeschnittenen Bereichs
            return cropCanvas//.getImageData(0, 0, w, h);
            });

            resolve(croppedImages);
        });
        }

        calculateIoU(boxA, boxB) {
            const [xA1, yA1, wA, hA] = boxA.bounding;
            const [xB1, yB1, wB, hB] = boxB.bounding;
        
            const xA2 = xA1 + wA;
            const yA2 = yA1 + hA;
            const xB2 = xB1 + wB;
            const yB2 = yB1 + hB;
        
            const xIntersection = Math.max(0, Math.min(xA2, xB2) - Math.max(xA1, xB1));
            const yIntersection = Math.max(0, Math.min(yA2, yB2) - Math.max(yA1, yB1));
        
            const intersectionArea = xIntersection * yIntersection;
            const boxAArea = wA * hA;
            const boxBArea = wB * hB;
        
            const iou = intersectionArea / (boxAArea + boxBArea - intersectionArea);
            return iou;
        }
        
        mergeBoxes(boxA, boxB) {
            const [xA1, yA1, wA, hA] = boxA.bounding;
            const [xB1, yB1, wB, hB] = boxB.bounding;
        
            const x1 = Math.min(xA1, xB1);
            const y1 = Math.min(yA1, yB1);
            const x2 = Math.max(xA1 + wA, xB1 + wB);
            const y2 = Math.max(yA1 + hA, yB1 + hB);
        
            const newBox = {
                id: boxA.id, // beibehalten oder anpassen
                label: boxA.label, // beibehalten oder anpassen
                probability: Math.max(boxA.probability, boxB.probability),
                bounding: [x1, y1, x2 - x1, y2 - y1]
            };
        
            return newBox;
        }

        combineOverlappingBoxes(boxes) {
            const mergedBoxes = [];
        
            while (boxes.length > 0) {
                let currentBox = boxes.pop();
                let overlappingBoxes = [];
        
                for (let i = 0; i < boxes.length; i++) {
                    const iou = this.calculateIoU(currentBox, boxes[i]);
                    if (iou > 0.90) {
                        overlappingBoxes.push(boxes.splice(i, 1)[0]);
                        i--;
                    }
                }
        
                if (overlappingBoxes.length > 0) {
                    overlappingBoxes.push(currentBox);
                    let mergedBox = overlappingBoxes.reduce(this.mergeBoxes);
                    mergedBoxes.push(mergedBox);
                } else {
                    mergedBoxes.push(currentBox);
                }
            }
        
            return mergedBoxes;
        }
        async  convertToImage(src) {
            const img = new Image();
            img.src = src;
            await img.decode();
            return img;
        }

        async analyseImage(imageToDisplayAndAnalyse,session,ort,settings) {
            try {
                
                let helper = this;
                //let imageOri = await  helper.addImageProcess("image3.jpg");
                let imageOri =imageToDisplayAndAnalyse;

                let scaleW = 640 / imageOri.width;
                let scaleH = 640 / imageOri.height;
                let imageOriData = helper.imageToImageData(imageOri);
                let imageHash = await helper.hashImageData(imageOriData);

                const lsAnalysedTbs = localStorage.getItem(imageHash);
                if(lsAnalysedTbs){
                    imageToDisplayAndAnalyse.analysed=true;
                    return JSON.parse(lsAnalysedTbs);
                }

                if(settings && settings.externalSourceFolder&& settings.externalSourceFolder!= ""){
                    const response = await fetch(`${settings.externalSourceFolder}/${imageHash}.json`);
                    if (response.ok) {
                        const analysed = await response.json()
                        localStorage.setItem(imageHash,JSON.stringify(analysed));
                        imageToDisplayAndAnalyse.analysed=true;
                        return  analysed
                    }
                }

                
                let image = await helper.resizeImage(imageOri, 640, 640);
                image = helper.imageToImageData(image);
                //const imageT = await ort.Tensor.fromImage(image, { tensorFormat: "RGBA" });
                const imageT = await ort.Tensor.fromImage(image,{ tensorFormat: "RGB" });

                // prepare feeds. use model input names as keys.
                //const feeds = { a: tensorA, b: tensorB };
                const modelInputShape = [1, 3, 640, 640];
                const tensor = new ort.Tensor(
                    "float32",
                    new Float32Array(modelInputShape.reduce((a, b) => a * b)),
                    modelInputShape
                );
                //await yolov10.run({ images: tensor });
                // feed inputs and run
                //const resultsTemp = await session.run({ images: tensor });
                const results = await session.run({ images: imageT });
                // read from results
                //const dataC = await results.output0.getData();
                let scoreThreshold = 0.2;
                let output0 = results.output0;
                let boxes = [];
                let idGenerator = 1;
                for (let idx = 0; idx < output0.dims[1]; idx++) {
                    const [left, top, right, bottom, conf, cid] = output0.data.slice(
                    idx * output0.dims[2],
                    (idx + 1) * output0.dims[2]
                    ); // get rows

                    if (conf < scoreThreshold) break; // break if conf is lesser than threshold (because it's sorted)

                    const [x, y, w, h] = [
                    left / scaleW , // upscale left
                    top / scaleH , // upscale top
                    (right - left) / scaleW, // upscale width
                    (bottom - top) / scaleH, // upscale height
                    ]; // keep boxes in maxSize range

                    boxes.push({
                        id:idGenerator,
                        label: cid,
                        probability: conf,
                        bounding: [x, y, w, h], // upscale box
                    }); // update boxes to draw later
                    idGenerator++;
                }

                let boxesCategorized = helper.categorizeBoxes(boxes,"label");
                let panels = boxesCategorized["1"].filter(panel => panel.probability > 0.5);
                let tbs = boxesCategorized["0"];

                tbs = helper.combineOverlappingBoxes(tbs)
                //panels = helper.combineOverlappingBoxes(panels)
                let sortedPanels = helper.sortBBs(panels,imageOri);

                const [panelsAssinged,tbsAssinged] = helper.assignTbsToPanels(sortedPanels,tbs);
                let tbsCategorized = helper.categorizeBoxes(tbsAssinged,"panelId");

                for (const [key, value] of Object.entries(tbsCategorized)) {
                   
                    let sortedtbs = helper.sortBBs(value,imageOri);
                    console.log(`${key}: ${value}`);
                }

                let orderID = 0;
                let resultTbsInOrder = [];
                for(let i = 0; i < panelsAssinged.length; i++) {
                    if(panelsAssinged[i].assignedTbs){
                        panelsAssinged[i].assignedTbs.sort((a, b) => a.order - b.order).forEach(tb => {
                            tb.orderID = orderID;
                            orderID++;
                            resultTbsInOrder.push(tb);
                        })
                    }
                }

                //helper.drawBoundingBoxes(ctx,boxes,imageDrawingParams.offsetX,imageDrawingParams.offsetY,imageDrawingParams.drawWidthRatio,imageDrawingParams.drawHeightRatio);
                //helper.drawBoundingBoxes(ctx,panelsAssinged,imageDrawingParams.offsetX,imageDrawingParams.offsetY,imageDrawingParams.drawWidthRatio,imageDrawingParams.drawHeightRatio);
                //helper.drawBoundingBoxes(ctx,resultTbsInOrder,imageDrawingParams.offsetX,imageDrawingParams.offsetY,imageDrawingParams.drawWidthRatio,imageDrawingParams.drawHeightRatio);

                
                const croppedImages = await helper.cropImage(imageOri,resultTbsInOrder)

                if(!this.workerTesseract)
                    this.workerTesseract = await Tesseract.createWorker('eng');

                for(let i = 0; i < croppedImages.length; i++) {
                    let croppedImage = croppedImages[i];
                    let ret = await this.workerTesseract.recognize(croppedImage)
                    console.log(ret.data.text);
                    resultTbsInOrder.find(tb => tb.id == croppedImage.boxId).text = ret.data.text
                }
                //await workerTesseract.terminate();

                const analysedTbs = {hash:imageHash, tbs:resultTbsInOrder.map(tb=>{return {text:tb.text,b:tb.bounding}})};
                localStorage.setItem(imageHash,JSON.stringify(analysedTbs.tbs));

                imageToDisplayAndAnalyse.analysed=true;

                return analysedTbs.tbs;

            } catch (e) {
                console.log(`failed : ${e}.`);
            }
        }

        removeChars(validChars, inputString) {
            var regex = new RegExp('[^' + validChars + ']', 'g');
            return inputString.replace(regex, '');
        }
        improveText(text) {

            let DTEXT = this.removeChars("abcdefghijklmnopqrstuvwxyz 0123456789\.,", text.toLowerCase().replace(new RegExp('-\n', 'g'), "").replace(new RegExp('\n', 'g'), " "))

            DTEXT = DTEXT.toLowerCase().replace(new RegExp(' t ', 'g'), " i ")
            DTEXT = DTEXT.toLowerCase().replace(new RegExp('1', 'g'), "i")
            DTEXT = DTEXT.toLowerCase().replace(new RegExp('0', 'g'), "o")

            DTEXT = DTEXT.replace(new RegExp('5', 'g'), "s")

            if (DTEXT.startsWith('t '))
                DTEXT = 'i' + DTEXT.substring(1);

            return DTEXT
        }


        talk(text) {
            if(!this.msg)
                this.msg = new SpeechSynthesisUtterance();
            //msg.rate = 1
            this.msg.rate = 1.3;
            //document.msg = this.msg;
            this.msg.lang = 'en-US';
            this.msg.text = this.improveText(text)
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(this.msg);
        }


}
