# triageRush Desktop Test App

This is the isolated, self-contained desktop pre-production test app.

It will be used to explore and validate a desktop-native triageRush
presentation before production game development begins. It must not import
code or runtime assets from `_testAppMobile`, `triageRush-app`, or
`patient-data`. Assets needed at runtime should be copied into this folder
deliberately.

The initial files are only an independent scaffold. The desktop game has not
yet been implemented.

## Preview

Run `start-desktop-preview.bat`, then open:

    http://localhost:8081

The desktop server uses port `8081`; the mobile test app uses port `8080`.
Both can therefore run at the same time.

