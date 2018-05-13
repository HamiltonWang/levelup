/* Copyright (c) 2012-2018 LevelUP contributors
 * See list at <https://github.com/level/levelup#contributing>
 * MIT License <https://github.com/level/levelup/blob/master/LICENSE.md>
 */

var levelup = require('../lib/levelup.js')
var memdown = require('memdown')
var common = require('./common')
var assert = require('referee').assert
var refute = require('referee').refute
var buster = require('bustermove')

buster.testCase('Init & open()', {
  'setUp': common.commonSetUp,
  'tearDown': common.commonTearDown,

  'levelup()': function () {
    assert.isFunction(levelup)
    assert.equals(levelup.length, 3) // db, options & callback arguments
    assert.exception(levelup, 'InitializationError') // no db
  },

  'open and close statuses': function (done) {
    levelup(memdown(), function (err, db) {
      refute(err, 'no error')
      assert.isTrue(db.isOpen())
      this.closeableDatabases.push(db)
      db.close(function (err) {
        refute(err)

        assert.isFalse(db.isOpen())
        assert.isTrue(db.isClosed())

        levelup(memdown(), function (err, db) {
          refute(err)
          assert.isObject(db)
          done()
        })
      })
    }.bind(this))
  },

  'without callback': function (done) {
    var db = levelup(memdown())
    this.closeableDatabases.push(db)
    assert.isObject(db)
    db.on('ready', function () {
      assert.isTrue(db.isOpen())
      done()
    })
  },

  'validate abstract-leveldown': function (done) {
    var down = memdown()
    Object.defineProperty(down, 'status', {
      get: function () { return null },
      set: function () {}
    })
    try {
      levelup(down)
    } catch (err) {
      assert.equals(err.message, '.status required, old abstract-leveldown')
      return done()
    }
    throw new Error('did not throw')
  }
})
