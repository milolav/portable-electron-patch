#!/usr/bin/env node
var program = require('commander');
var asar = require('asar');
var fs = require('fs-extra');

program.version('v' + require('./package.json').version);

program.arguments('<your_electron_asar>').action(function (file) {
  if (!fs.existsSync(file)) {
    console.error("File %s does not exist", file);
    process.exit(1);
  }

  console.log("Processing file %s...", file);

  //extract electron.asar
  asar.extractAll(file, "electron_asar_unpacked");

  //read file contents
  var contents = fs.readFileSync("electron_asar_unpacked/browser/init.js", "utf-8");

  //find out line endings in file
  var fileEol = contents.match(/(\r\n|\r|\n)/)[0];

  //find code in charge of setting application paths
  var searchString = [
    "// Set the user path according to application's name.",
    "app.setPath('userData', path.join(app.getPath('appData'), app.getName()))",
    "app.setPath('userCache', path.join(app.getPath('cache'), app.getName()))",
    "app.setAppPath(packagePath)"
  ].join(fileEol);

  //replacement code with portable arguments
  var replaceString = [
    "// Set the portable path instead of user path according to application's name.",
    "var appProfileDir = 'Profile'",
    "for (let arg of process.argv) {",
    "  if (arg.indexOf('--portable-profile-dir=') === 0) {",
    "    appProfileDir = arg.substr(arg.indexOf('=') + 1)",
    "  }",
    "}",
    "var profilePath = path.join(path.dirname(process.execPath), appProfileDir)",
    "app.setPath('userData', profilePath)",
    "app.setPath('userCache', profilePath)"
  ].join(fileEol);

  //replace code
  newContents = contents.replace(searchString, replaceString);

  //check if code block was replaced
  if (newContents == contents) {
    console.log("Unable to find search string. File was not modified.");
    fs.removeSync("electron_asar_unpacked");
    process.exit(1);
  }

  //backup original file
  console.log("Creating backup...");
  fs.copySync(file, file + "_original");

  //write it back to the file
  fs.writeFileSync("electron_asar_unpacked/browser/init.js", newContents, 'utf8');

  //create package
  asar.createPackage("electron_asar_unpacked", file, function (error) {
    if (error) {
      console.error(error.stack);
      process.exit(1);
    } else {
      //if everything is ok, remove unpacked folder
      fs.removeSync("electron_asar_unpacked");
      console.log("File patched successfully!");
    }
  });
});
program.parse(process.argv);
if (program.args.length === 0) { program.help(); }
