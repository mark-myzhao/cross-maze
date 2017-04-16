<template>
  <div class="hello">
    <div id="game"></div>
    <div id="speech-bar">
      <div class="bar" id="up">{{controlBar[0]}}</div>
      <div class="bar" id="down">{{controlBar[1]}}</div>
      <div class="bar" id="left">{{controlBar[2]}}</div>
      <div class="bar" id="right">{{controlBar[3]}}</div>
    </div>
  </div>
</template>

<script>
import * as basr from '../service/record'
import mp from '../lib/marked-position.js'
import sentences from '../lib/sentences.js'
import wc from '../lib/word-comparator.js'

window.PIXI = require('phaser/build/custom/pixi')
window.p2 = require('phaser/build/custom/p2')
window.Phaser = require('phaser/build/custom/phaser-split')

export default {
  name: 'game',
  created () {
    let ready = () => {

      var game = new Phaser.Game(864, 672, Phaser.CANVAS, 'game')

      var PhaserGame = function (game) {
        //  config
        this.map = null
        this.layer = null
        this.car = null

        this.safetile = 1
        this.gridsize = 32

        this.speed = 70
        this.threshold = 3
        this.turnSpeed = 150

        this.marker = new Phaser.Point()
        this.turnPoint = new Phaser.Point()

        this.directions = [ null, null, null, null, null ]
        this.opposites = [ Phaser.NONE, Phaser.RIGHT, Phaser.LEFT, Phaser.DOWN, Phaser.UP ]

        this.current = Phaser.UP
        this.turning = Phaser.NONE

        this.buffPos = mp.buffPos
        this.currentHighlight = 0

        this.lastX = 0
        this.lastY = 0
        this.counter = 0
        this.lastIsRecording = false
        this.isRecording = false
        this.voice = null
      }

      PhaserGame.prototype = {

        init: function () {
          this.physics.startSystem(Phaser.Physics.ARCADE)
        },

        preload: function () {
          //  We need this because the assets are on Amazon S3
          //  Remove the next 2 lines if running locally
          this.load.tilemap('map', 'static/img/maze3.json', null, Phaser.Tilemap.TILED_JSON)
          this.load.image('tiles', 'static/img/tiles.png')
          this.load.image('car', 'static/img/car.png')
        },

        create: function () {
          this.map = this.add.tilemap('map')
          this.map.addTilesetImage('tiles', 'tiles')

          this.layer = this.map.createLayer('Tile Layer 1')

          this.map.setCollision(6, true, this.layer)
          this.map.setCollision(13, true, this.layer)

          this.car = this.add.sprite(48, 48, 'car')
          this.car.anchor.set(0.5)

          this.physics.arcade.enable(this.car)

          this.cursors = this.input.keyboard.createCursorKeys()

          this.move(Phaser.DOWN)
        },

        //  check input
        checkKeys: function () {
          var result = this.checkSpeech()

          if (result) {

          }
          // if (true) {
          //   this.checkDirection(Phaser.RIGHT)
          //   // console.log(this.lastX + ' ' + this.lastY);
          //   if (this.car.x === this.lastX && this.car.y === this.lastY) {
          //     this.checkDirection(Phaser.DOWN)
          //   }
          //   return
          // }

          if (this.cursors.left.isDown && this.current !== Phaser.LEFT) {
            this.checkDirection(Phaser.LEFT)
          } else if (this.cursors.right.isDown && this.current !== Phaser.RIGHT) {
            this.checkDirection(Phaser.RIGHT)
          } else if (this.cursors.up.isDown && this.current !== Phaser.UP) {
            this.checkDirection(Phaser.UP)
          } else if (this.cursors.down.isDown && this.current !== Phaser.DOWN) {
            this.checkDirection(Phaser.DOWN)
          } else {
            //  This forces them to hold the key down to turn the corner
            this.turning = Phaser.NONE
          }
        },

        checkDirection: function (turnTo) {
          if (this.turning === turnTo || this.directions[turnTo] === null ||
          this.directions[turnTo].index !== this.safetile) {
            //  Invalid direction if they're already set to turn that way
            //  Or there is no tile there, or the tile isn't index a floor tile
            return
          }

          //  Check if they want to turn around and can
          if (this.current === this.opposites[turnTo]) {
            this.move(turnTo)
          } else {
            this.turning = turnTo

            this.turnPoint.x = (this.marker.x * this.gridsize) + (this.gridsize / 2)
            this.turnPoint.y = (this.marker.y * this.gridsize) + (this.gridsize / 2)
          }
        },

        isRecordArea: function () {
          // console.log(this.car.x)
          for (let i in this.buffPos) {
            if (this.buffPos[i].x * this.gridsize + 16 === parseInt(this.car.x)) {
              if (this.car.y >= this.buffPos[i].y * this.gridsize &&
              this.car.y <= this.buffPos[i].y * this.gridsize + 32) {
                return true
              }
            }
            if (this.buffPos[i].y * this.gridsize + 16 === parseInt(this.car.y)) {
              if (this.car.x >= this.buffPos[i].x * this.gridsize &&
              this.car.x <= this.buffPos[i].x * this.gridsize + 32) {
                return true
              }
            }
          }
          return false
        },

        checkSpeech: function () {
          //  use speech test here
          this.isRecording = this.isRecordArea()
          if (this.lastIsRecording != this.isRecording) {
            //  start record
            if (this.isRecording) {
              console.log('Start !')
              this.voice = basr.start()
            } else {
              console.log('Stop !')
              this.voice
              .end()
              .result()
              .then(
                function (res) {
                  console.log('Result: ' + wc.compare('你好', res))
                },
                function (error) {
                  console.error('Error: ' + JSON.stringify(error))
                }
              )
              ++this.currentHighlight
            }
          }
          this.lastIsRecording = this.isRecording

          return true
        },

        checkSuccess: function (x, y) {
          return x === 25 && y === 19
        },

        turn: function () {
          var cx = Math.floor(this.car.x)
          var cy = Math.floor(this.car.y)

          //  This needs a threshold, because at high speeds you can't turn because the coordinates skip past
          if (!this.math.fuzzyEqual(cx, this.turnPoint.x, this.threshold) ||
          !this.math.fuzzyEqual(cy, this.turnPoint.y, this.threshold)) {
            return false
          }

          this.car.x = this.turnPoint.x
          this.car.y = this.turnPoint.y

          this.car.body.reset(this.turnPoint.x, this.turnPoint.y)

          this.move(this.turning)

          this.turning = Phaser.NONE

          return true
        },

        move: function (direction) {
          //  gerenally speed up
          if (this.speed < 350) this.speed += 2
          var speed = this.speed

          if (direction === Phaser.LEFT || direction === Phaser.UP) {
            speed = -speed
          }

          if (direction === Phaser.LEFT || direction === Phaser.RIGHT) {
            this.car.body.velocity.x = speed
          } else {
            this.car.body.velocity.y = speed
          }

          this.add.tween(this.car).to({ angle: this.getAngle(direction) }, this.turnSpeed, 'Linear', true)

          this.current = direction
        },

        getAngle: function (to) {
          //  About-face?
          if (this.current === this.opposites[to]) {
            return '180'
          }

          if ((this.current === Phaser.UP && to === Phaser.LEFT) ||
          (this.current === Phaser.DOWN && to === Phaser.RIGHT) ||
          (this.current === Phaser.LEFT && to === Phaser.DOWN) ||
          (this.current === Phaser.RIGHT && to === Phaser.UP)) {
            return '-90'
          }

          return '90'
        },

        //  automatic invoke
        update: function () {
          //  check lose
          if (this.car.x === this.lastX && this.car.y === this.lastY) {
            if (this.counter++ > 25) {
              // console.log('You lose')
            }
          }

          //  check control
          this.checkSpeech()
          //  check success
          this.physics.arcade.collide(this.car, this.layer)

          this.marker.x = this.math.snapToFloor(Math.floor(this.car.x), this.gridsize) / this.gridsize
          this.marker.y = this.math.snapToFloor(Math.floor(this.car.y), this.gridsize) / this.gridsize

          if (this.checkSuccess(this.marker.x, this.marker.y)) {
            console.log('Success')
          }
          //  Update our grid sensors
          this.directions[1] = this.map.getTileLeft(this.layer.index, this.marker.x, this.marker.y)
          this.directions[2] = this.map.getTileRight(this.layer.index, this.marker.x, this.marker.y)
          this.directions[3] = this.map.getTileAbove(this.layer.index, this.marker.x, this.marker.y)
          this.directions[4] = this.map.getTileBelow(this.layer.index, this.marker.x, this.marker.y)

          this.checkKeys()

          if (this.turning !== Phaser.NONE) {
            this.turn()
          }

          this.lastX = this.car.x
          this.lastY = this.car.y
        },

        setMark: function(x, y) {
          this.game.debug.geom(new Phaser.Rectangle(
          x * this.gridsize, y * this.gridsize, 32, 32), 'rgba(0,255,0,0.3)', true)
        },

        render: function () {
          this.setMark(25, 19)

          for (let i in this.buffPos) {
            this.setMark(
            this.buffPos[i].x,
            this.buffPos[i].y)
          }
          //  Un-comment this to see the debug drawing
          // 可以走的方向
          var avaiableDir = ''
          for (var t = 1; t < 5; t++) {
            if (this.directions[t] === null) {
              continue
            }

            var color = 'rgba(0,255,0,0.3)'

            if (this.directions[t].index !== this.safetile) {

              color = 'rgba(255,0,0,0.3)'
            } else {
              avaiableDir += t;
            }

            if (t === this.current) {
              // color = 'rgba(255,255,255,0.3)'
            }

            // this.game.debug.geom(new Phaser.Rectangle(
            //   this.directions[t].worldX,
            //   this.directions[t].worldY, 32, 32), color, true)
          }

          if (avaiableDir.length > 1 && avaiableDir !== '12' && avaiableDir !== '34') {
            // console.log('turn')
          }
        }
      }

      game.state.add('Game', PhaserGame, true)
    }

    basr
      .authorize({
          url: '/api/speech'
        })
      .then(ready)
      .catch((err) => {
        console.log('err happens')
      })

  },
  data () {
    return {
      controlBar: [
        'up',
        'down',
        'left',
        'right'
      ]
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

#background {
  background-color: #E0E4F1;
}

#div {
  border-radius: 5px;
  box-shadow: 5px;
}

#speech-bar {
  width: 210px;
  height: 210px;
  // background-color: black;
  position: fixed;
  top: 100px;
  right: 200px;
  float: right;
}

.bar {
  width: 70px;
  height: 70px;
  // background-color: white;
  background-image: url("/static/img/bar.png");
  background-size: 100% 50%;
  background-repeat: no-repeat;
  background-position:center center;
  color: white;
  position: absolute;
  text-align: center;
  line-height: 70px;
}

#up {
  left: 70px;
}

#down {
  left: 70px;
  bottom: 0px;
}

#left {
  top: 70px;
}

#right {
  right: 0px;
  top: 70px;
}
</style>
