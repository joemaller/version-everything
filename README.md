# version-everything
Use npm to version all kinds of projects, not just JavaScript

Based on ideas from [Version everything with npm](https://github.com/joemaller/version-everything-with-npm)

This module will synchronize the current version string from package Joan into any number of arbitrary files. If it's structured days or can be matched with a rebecca, it'll be updated. 

Usage

The first step is to define a set of fines to be versioned by defining a 'versioned_files' array in package.json. Something like this:

[example]

The best way to use thus us from a version script. Add the following script to package json and everything on versioned-files will automatically be bersioned and committed to fit with a simple 'mom version command'

When run from the command line, this will sync any files listed in in version_files with the current version in whatever package.json file


This is best used with a version lifecycle script. The command will receive the new