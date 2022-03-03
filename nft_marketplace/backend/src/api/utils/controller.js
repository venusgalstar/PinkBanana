const formidable = require('formidable');
const fs = require('fs');
const MD5 = require("md5");
const path = require("path");

const upload_path = "/public/uploads/";

exports.viewFile = async(req, res) => {
    var fileSavingPath = process.cwd() + upload_path;
    res.sendFile(fileSavingPath + req.params.filename);
}

exports.uploadFile = (req, res) => {
    var form = new formidable.IncomingForm();
    form.parse(req, async function (err, fields, files) {
      var oldpath = files.itemFile.filepath;
      var filename = MD5(Date.now().toString()) + "-" + files.itemFile.originalFilename ;
      var fileSavingPath = process.cwd() + upload_path + filename;
      await fs.copyFile(oldpath, fileSavingPath, function (err) {
        fs.unlink(oldpath, ()=>{});
        if (err) {
          console.log("file uploading failed ");
            return res.status(401).send({ success: false, message: "Empty file sent!" });
        }
        console.log("file uploading succeed : ", filename);
        return res.status(200).send({ success: true, path: filename, message: "Successfully Update a Author" });
      });
    });    
}

exports.uploadMultipleFile = async (req, res) => {
  var form = new formidable.IncomingForm();
  form.parse(req, async function (err, fields, files) 
  {
    console.log("fields.fileArryLength = ", fields.fileArryLength);
    let i; let fileNameResultArr = [];
    for(i=0; i<fields.fileArryLength; i++)
    {
      let oldpath = eval("files.fileItem"+i).filepath;
      console.log("saving ", i, "th file...");
      let filename = MD5(Date.now().toString()) + "-" + eval("files.fileItem"+i).originalFilename;
      let fileSavingPath = process.cwd() + upload_path + filename;
      await fs.copyFile(oldpath, fileSavingPath, function (err) {
        fs.unlink(oldpath, ()=>{});
        if (err) {
          console.log("file uploading failed ");
            return res.status(401).send({ success: false, message: "Empty file sent!" });
        }
      });
      fileNameResultArr[i] = filename;
    }    
    console.log("file uploading succeed : ", fileNameResultArr);
    return res.status(200).send({ success: true, paths: fileNameResultArr, message: "Successfully Update a Author" });
    
  });    
}
