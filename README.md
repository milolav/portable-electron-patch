# Portable Electron patch

Script modifies the `/browser/init.js` inside electron.asar by adding the `--portable-profile-dir` argument and setting the `userData` and `userCache` folders to that path.

If electron app does not use `app.getPath('appData')` somewhere else in the code it can be run as a portable application.



## Usage

```
  Usage: portable-electron-patch <your_electron_asar>
  Example: portable-electron-patch E:\WhatsApp\resources\electron.asar
```



## More info

[Making WhatsApp desktop application portable](https://gist.github.com/milolav/f7a12285761db9726bce2aff11adb3af)



## License

MIT