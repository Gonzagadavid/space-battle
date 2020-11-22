const Sprite = function (sourceX, sourceY, width, height, x, y) {
  this.sourceX = sourceX
  this.sourceY = sourceY
  this.width = width
  this.height = height
  this.x = x
  this.y = y
  this.vx = 0
  this.vy = 0
}

Sprite.prototype.centerX = function () {
  return this.x + (this.width / 2)
}

Sprite.prototype.centerY = function () {
  return this.y + (this.height / 2)
}

Sprite.prototype.halfWidth = function () {
  return this.width / 2
}

Sprite.prototype.halfHeight = function () {
  return this.height / 2
}

const Alien = function (sourceX, sourceY, width, height, x, y) {
  Sprite.call(this, sourceX, sourceY, width, height, x, y)
  this.NORMAL = 1
  this.EXPLODED = 2
  this.CRAZY = 3
  this.state = this.NORMAL
  this.mvStyle = this.NORMAL
}

Alien.prototype = Object.create(Sprite.prototype)

Alien.prototype.explode = function () {
  this.sourceX = 80
  this.width = this.height = 56
}

const ObjectMessage = function (y, text, color) {
  this.x = 0
  this.y = y
  this.text = text
  this.visible = true
  this.font = 'normal bold 40px mrsmonster'
  this.color = color
  this.baseline = 'top'
}
