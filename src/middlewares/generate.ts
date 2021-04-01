import fs from 'fs';
import Jimp from 'jimp'
import firebase from 'firebase';
//const Jimp = require('jimp');

/**
 *  Generate les images avec les couleurs de la spécification du produit/composant
 *  @param {string} filePath 
 *  @param {string} idProduct 
 *  @param {Array<string>} colors 
 */ 
export const generateAllImagesColors = async (filePath: string, idProduct: string, selectionColors: Array<string>): Promise<void> => {
    if(!fs.existsSync('./temp/')) fs.mkdirSync('./temp/');//add temp folder
    let destPath: string = process.cwd() + `/temp/${idProduct}/`;// process.cwd()
    if(!fs.existsSync(destPath)){
        fs.mkdirSync(destPath);//add destPath folder in temp
    }

    let allColors = [//TODO GET COLORS FROM DB
        { selected: "rouge", color: 'red', hue: 0}, 
        { selected: "orange", color: 'red', hue: 25}, 
        { selected: "jaune", color: 'red', hue: 50}, 
        { selected: "chartreuse", color: 'red', hue: 75}, 
        { selected: "vert", color: 'green', hue: 0}, 
        { selected: "turquoise", color: 'green', hue: 25}, 
        { selected: "cyan", color: 'green', hue: 50}, 
        { selected: "outremer", color: 'green', hue: 75}, 
        { selected: "bleu", color: 'blue', hue: 0}, 
        { selected: "violet", color: 'blue', hue: 25}, 
        { selected: "magenta", color: 'blue', hue: 50}, 
        { selected: "carmin", color: 'blue', hue: 75}
    ]

    let tabColorSelected: Array<any> = [] 
    allColors.forEach((item: any) => {
        selectionColors.forEach((el: string) => {
            if(item.selected === el){
                tabColorSelected.push(item)
            }
        })
    });
    let ttPromise: Array<any> = []
    tabColorSelected.forEach(async(element) => {
        ttPromise.push(await generateImg(filePath, destPath, element))
    });
    Promise.all(ttPromise).then((data) => {
        console.log('OK')
        //fs.existsSync(pathDest) ? fs.rmdirSync(pathDest, { recursive: true }) : null;//delete folder temp
    }).catch((err) => {
        throw err
    })
};

/**
 *  Generate image
 */ 
const generateImg = async (filePath: string, destPath: string, element: any): Promise<void> => {
    return new Promise(async(resolve, reject) => {
        await Jimp.read(filePath, async(err: any, resp: any) => {
            if (err) reject(err);
            else{
                resolve(await resp
                    .resize(400, 350) // resize
                    .quality(60) // set JPEG quality
                    .color([{ apply: element.color, params: [100] }, { apply: 'hue', params: [element.hue] }])
                    .write(destPath + 'img-' + element.selected + '.jpg')); // save
            }
        });
    });
}