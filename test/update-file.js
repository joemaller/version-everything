'use strict';
const path = require('path');
const should = require('chai').should();
const assert = require('chai').assert;
const updateFile = require('../app/update-file');

describe('Update a file', function() {

  it('requires a file argument', function() {
    const file = function() {
      updateFile();
    }
    file.should.throw(Error);
  });

  it('requires a version string argument', function() {
    const file = function() {
      updateFile('foo.file');
    }
    file.should.throw(Error);
  });

  // it('accepts a string file path', function() {
  //   const foo = 5;
  // })
  // it('accepts a filestream', function() { assert.fail() })
  it('should increment a plain text file (regex)', function() { assert.fail() })
  it('should increment a json file', function() {
    const file = updateFile('./test/fixture/deep/dotfile/file.json', '1.0.0');
    file.should.have.string('foo');
  });
  it('should increment a json file with a replacer function', function() { assert.fail() })
  it('should increment a json file with different indentation', function() { assert.fail() })
  it('should increment a yaml file', function() { assert.fail() })
  it('should increment an xml file', function() { assert.fail() })
  it('should increment an xml plist file', function() { assert.fail() })
  it('should increment a json file without a file extension', function() { assert.fail() })
  it('should increment a yaml file without a file extension', function() { assert.fail() })
  it('should increment an xml file without a file extension', function() { assert.fail() })
  it('adds version to version-less json file', function() { assert.fail() })
  it('passes version-less plain files through unchanged', function() { assert.fail() })

  describe('Test output (console.log)', function() {
    let output;
    const cwd = process.cwd();
    const consoleLog = console.log;
    const stdoutWrite = process.stdout.write;

    // ref https://github.com/mochajs/mocha/wiki/Mess-with-globals
    const cleanup = function() {
      process.chdir(cwd);
      console.log = consoleLog;
      process.stdout.write = stdoutWrite;
    };

    beforeEach(function() {
      output = '';
      process.stdout.write = console.log = (str) => output += str;
    });

    afterEach(cleanup);

    it('shows the file, current version and updated version', function() {
      try {
        const file = '.path/to/file.js'
        const updatedFile = updateFile(file, '1.0.0');
        output.should.have.string(file)
        output.should.match(/updating somefile from 8.0.1 to 1.2.23/);
        cleanup();
      } catch (err) {
        cleanup();
        throw err
      }
    });

  })
});
