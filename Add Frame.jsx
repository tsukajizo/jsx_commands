﻿

const FORMAT_SQUARE = "正方形";
const FORMAT_SQUARE_NUM = 0;
const FORMAT_4_5 = "4 x 5";
const FORMAT_4_5_NUM = 1;
const FORMAT_SIMILARITY = "相似";
const FORMAT_SIMILARITY_NUM = 1;

const TARGET_ALL = "すべて";
const TARGET_PORTRAIT = "縦長のみ";
const TARGET_LANDSCAPE = "横長のみ";

showWindiow ()

function showWindiow(){
    var w = new Window('dialog','枠線の追加');
    w .bounds = [200,100,580,500];
    w .activeDocPnl = w.add("panel",[10,5,370,150],"方式");
    w .activeDocPnl .formatLabel = w.activeDocPnl .add("statictext",[10,10,60,30], "サイズ : ");
    w.activeDocPnl .formatList = w.activeDocPnl.add("dropdownlist",[60,10,200,30],[FORMAT_SQUARE,FORMAT_SIMILARITY]);
    w.activeDocPnl .formatList .selection = 0;
    w.activeDocPnl .formatLabel = w.activeDocPnl .add("statictext",[10,40,60,60], "対象 : ");
    w.activeDocPnl .targetList = w.activeDocPnl.add("dropdownlist",[60,40,200,60],[TARGET_ALL,TARGET_PORTRAIT,TARGET_LANDSCAPE]);
    w.activeDocPnl .targetList .selection = 0

    
    w.activeDocPnl .scaleLabel = w.activeDocPnl .add("statictext",[10,70,60,90], "倍率 : ");
    w.activeDocPnl .scaleEdit = w.activeDocPnl .add("editText",[50,70,100,90], 1);
    var onScaleChange = function() {
        var  editScale = w.activeDocPnl.scaleEdit.text
        if( editScale < 1 || editScale.length == 0) {
             w.activeDocPnl.scaleEdit.text = 1
             alert("1より大きいサイズを指定してください")
        }
    }
 
    w.activeDocPnl .scaleEdit.onChange = onScaleChange
    
    w.colorPnl = w.add("panel",[10,150,370,280],"背景色");   
    w.colorPnl.colorBox = w.colorPnl.add("panel",[10,50,60,100],"");   
    w.colorPnl.colorBox.graphics.backgroundColor = w.colorPnl.colorBox.graphics.newBrush (w.graphics.BrushType.SOLID_COLOR, [0.5, 0.0, 0.0]);
    w.colorPnl.labelR = w.colorPnl.add("statictext",[10,15,60,25],"R :");
    w.colorPnl.editR = w.colorPnl.add("editText",[30,10,100,20],"255");
    w.colorPnl.labelG = w.colorPnl.add("statictext",[120,15,190,25],"G :");
    w.colorPnl.editG = w.colorPnl.add("editText",[140,10,210,20],"255");
    w.colorPnl.labelB = w.colorPnl.add("statictext",[230,15,300,25],"B :");
    w.colorPnl.editB = w.colorPnl.add("editText",[250,10,320,20],"255");
    var onChangeListener = function() {
        var colorR = w.colorPnl.editR.text;
        var colorG = w.colorPnl.editG.text;
        var colorB = w.colorPnl.editB.text;
        if( colorR > 255 || colorR < 0 || colorG > 255 || colorG < 0 || colorB > 255 || colorB < 0 ){
            w.colorPnl.editR.text = 0;
            w.colorPnl.editG.text = 0;
            w.colorPnl.editB.text = 0;
        }
         w.colorPnl.colorBox.graphics.backgroundColor = w.colorPnl.colorBox.graphics.newBrush (w.graphics.BrushType.SOLID_COLOR, [w.colorPnl.editR.text/255.0, w.colorPnl.editG.text/255.0, w.colorPnl.editB.text/255.0]);
     }
    w.colorPnl.colorBox.graphics.backgroundColor = w.colorPnl.colorBox.graphics.newBrush (w.graphics.BrushType.SOLID_COLOR, [w.colorPnl.editR.text/255.0, w.colorPnl.editG.text/255.0, w.colorPnl.editB.text/255.0]);
    w.colorPnl.editR.onChange = onChangeListener;
    w.colorPnl.editG.onChange = onChangeListener;
    w.colorPnl.editB.onChange = onChangeListener;
    
    w.inputPnl = w.add("panel",[10,290,370,350],"対象フォルダ:");
    w.inputPnl.inputButton = w.inputPnl.add("button",[10,10,60,30],"開く");
    w.inputPnl.pathText = w.inputPnl.add("statictext",[70,10,480,30],"");
    var folder = null;
    w.inputPnl.inputButton.onClick = function(){
        folder = Folder.selectDialog('画像があるフォルダを選択してください');
        w.inputPnl.pathText.text = folder.fullName
    }
    
    w.okBtn = w.add("button",[80,365,175,380], "実行");
    w.okBtn.onClick = function(){
        if( folder == null ){
            alert("フォルダを選択してください");
            return;
        }
        var colorR = w.colorPnl.editR.text;
        var colorG = w.colorPnl.editG.text;
        var colorB = w.colorPnl.editB.text;
        var format = w.activeDocPnl.formatList.selection;
        var target  = w.activeDocPnl.targetList.selection;
        var scale = w.activeDocPnl.scaleEdit.text;
       
        doProcess (folder, format, target, scale, colorR, colorG,colorB);
         w.close();
    }
    w.cancelBtn = w.add("button",[190,365,285,380], "キャンセル");
    w.cancelBtn.onClick = function() {
        w.close();
    }
    w.show();
}

function doProcess(folder, format, target, scale , colorR, colorG, colorB){
    if(!folder) return;
    var files = folder.getFiles (/jpe?g/);
    if( files.length == 0 ) return;
     
    var dir = new Folder(folder.fullName + '_proc');
    if (! dir.exists) dir.create();
       
    for(var i = 0; i < files.length; i++){
        var file = files[i];
        app.open(file);
        shirowaku (app.activeDocument, format, target, scale, colorR, colorG, colorB)
        
        var exportPath = dir.fullName + '/' + file.name
        saveAsJpeg (app, exportPath)
        app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
    }
}

function saveAsJpeg(app,path){
    var file_obj = new File(path);
    var jpg_opt = new JPEGSaveOptions();
    jpg_opt.embedColorProfile = true;
    jpg_opt.quality = 12;
    jpg_opt.formatOptions = FormatOptions.PROGRESSIVE;
    jpg_opt.scans = 3;
    jpg_opt.matte = MatteType.NONE;
    app.activeDocument.saveAs(file_obj, jpg_opt, true, Extension.LOWERCASE);
}

function shirowaku(doc, format, target, scale, colorR, colorG, colorB){
    var bg = doc.layers.length;
    doc.layers[bg-1].isBackgroundLayer = false;

    var docWidth = doc.width;
    var docHeight = doc.height;
    var newDocWidth = docWidth;
    var newDocHeight = docHeight;
 
    if(format == FORMAT_SQUARE_NUM) {
       
        if(docHeight > docWidth){
            newDocWidth = docHeight*scale
            newDocHeight = docHeight*scale
        } else {
            newDocHeight = docWidth*scale
            newDocHeight = docWidth*scale
        }
    } else if(format == FORMAT_SIMILARITY_NUM) {
        newDocWidth = docWidth * scale
        newDocHeight = docHeight + newDocWidth - docWidth;
    }

    doc.resizeCanvas( newDocWidth, newDocHeight);
    var layer =  doc.artLayers.add()
    layer.name = "backgroundLayer"

    var colorObject = new SolidColor();
    colorObject.rgb.red = colorR;
    colorObject.rgb.green = colorG;
    colorObject.rgb.blue = colorB;
    
    doc.selection.selectAll();
    doc.selection.fill(colorObject);
    doc.selection.deselect();
    doc.layers.getByName(layer.name).move(doc.layers[1],ElementPlacement.PLACEAFTER);
 }