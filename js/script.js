// canvas

const cnv = document.querySelector('canvas')

// contexton de renderização 2d

const ctx = cnv.getContext('2d')

// recursos de jogo=====================================>
// arrays

const sprites = []
const assetsToload = []
const missiles = []
const aliens = []
const messages = []

// variaveis uteis
let alienFrenquency = 100
let alienTimer = 0
let shots = 0
let hits = 0
let acurary = 0
const scoreTowin = 70
const FIRE = 0; const EXPLOSION = 1

// sprites

// cenario
const background = new Sprite(0, 56, 400, 500, 0, 0)
sprites.push(background)

// nave
const defender = new Sprite(0, 0, 30, 50, 185, 450)
sprites.push(defender)

// mensagem da tela inicial
const startMessage = new ObjectMessage(cnv.height / 2, 'PRESS ENTER', '#f00')
messages.push(startMessage)

// mensagem de pausa
const pausedMessage = new ObjectMessage(cnv.height / 2, 'PAUSED', '#f00')
pausedMessage.visible = false
messages.push(pausedMessage)

// mensagem de game over
const gameOverMessage = new ObjectMessage(cnv.height / 2, '', '#f00')
gameOverMessage.visible = false
messages.push(gameOverMessage)

// placar
const scoreMessage = new ObjectMessage(10, '', '#0f0')
scoreMessage.font = 'normal bold 25px mrsmonster'
updateScore()
messages.push(scoreMessage)

// imagem

const img = new Image()
img.addEventListener(' load', loadHandler, false)
img.src = 'img.png'
assetsToload.push(img)

// contador de recursos

let loadedAssets = 0

// entradas

const LEFT = 37; const RIGHT = 39; const ENTER = 13; const SPACE = 32

// ações

let mvLeft = mvRight = shoot = spaceIsDown = false

// estados do jogo

const LOADING = 0; const PLAYING = 1; const PAUSED = 2; const OVER = 3

let gameState = LOADING

// listeners

window.addEventListener('keydown', e => {
  const key = e.keyCode
  switch (key) {
    case LEFT:
      mvLeft = true
      break

    case RIGHT:
      mvRight = true
      break
    case SPACE:
      if (!spaceIsDown) {
        shoot = true
        spaceIsDown = true
      }
      break
  }
}, false)

window.addEventListener('keyup', e => {
  const key = e.keyCode
  switch (key) {
    case LEFT:
      mvLeft = false
      break

    case RIGHT:
      mvRight = false
      break
    case ENTER:
      if (gameState !== OVER) {
        if (gameState !== PLAYING) {
          gameState = PLAYING
          startMessage.visible = false
          pausedMessage.visible = false
        } else {
          gameState = PAUSED
          pausedMessage.visible = true
        }
      }
      break
    case SPACE:
      spaceIsDown = false
  }
}, false)

// funções=============================================>

function loadHandler () {
  loadedAssets++
  if (loadedAssets === assetsToload.length) {
    img.removeEventListener('load', loadHandler, false)
    // inicia o jogo
    gameState = PAUSED
  }
}

function loop () {
  requestAnimationFrame(loop, cnv)
  // define as ações com base no estado do jogo
  switch (gameState) {
    case LOADING:
      console.log('LOADING...')
      break

    case PLAYING:
      update()
      break

    case OVER:
      endGame()
      break
  }
  render()
}

function update () {
  // move para a esquerda
  if (mvLeft && !mvRight) {
    defender.vx = -5
  }

  // move para a direita
  if (mvRight && !mvLeft) {
    defender.vx = 5
  }

  // para a nave
  if (!mvLeft && !mvRight) {
    defender.vx = 0
  }

  // disparao canhão
  if (shoot) {
    fireMissile()
    shoot = false
  }

  // atualiza a posição
  defender.x = Math.max(0, Math.min(cnv.width - defender.width, defender.x + defender.vx))

  // atualiza a posição do misseis
  for (let i in missiles) {
    const missile = missiles[i]
    missile.y += missile.vy
    if (missile.y < -missile.height) {
      removeObjects(missile, missiles)
      removeObjects(missile, sprites)
      updateScore()
      i--
    }
  }

  // incremento do alienTimer
  alienTimer++

  // criação do alien, caso o timer se iguale a frequencia
  if (alienTimer === alienFrenquency) {
    makeAlien()
    alienTimer = 0
    // ajuste na frequencia da criação de aliens
    if (alienFrenquency > 2) {
      alienFrenquency--
    }
  }

  // move os aliens
  for (let i in aliens) {
    const alien = aliens[i]
    if (alien.state !== alien.EXPLODED) {
      alien.y += alien.vy
      if (alien.state === alien.CRAZY) {
        if (alien.x > cnv.width - alien.width || alien.x < 0) {
          alien.vx *= -1
        }
        alien.x += alien.vx
      }
    }
    // confere se algum alien chegou a Terra
    if (alien.y > cnv.height + alien.height) {
      gameState = OVER
      console.log('game over')
    }

    // confere se algum alien colidiu com a nave
    if (collide(alien, defender)) {
      destroyAlien(alien)
      removeObjects(defender, sprites)
      gameState = OVER
    }

    // confere se algum alien foi destruido
    for (let j in missiles) {
      const missile = missiles[j]
      if (collide(missile, alien) && alien.state !== alien.EXPLODED) {
        destroyAlien(alien)
        hits++
        updateScore()
        if (parseInt(hits) === scoreTowin) {
          gameState = OVER
          // destroi todos os aliens
          for (const k in aliens) {
            const alienk = aliens[k]
            destroyAlien(alienk)
          }
        }
        removeObjects(missile, missiles)
        removeObjects(missile, sprites)
        j--
        i--
      }
    }
  }// fim da movimentação dos aliens
}

// criação dos misseis
function fireMissile () {
  const missile = new Sprite(136, 12, 8, 13, defender.centerX() - 4, defender.y - 13)
  missile.vy = -8
  sprites.push(missile)
  missiles.push(missile)
  playSound(FIRE)
  shots++
}
// criação de aliens
function makeAlien () {
  // cria um valor aleatorio entre 0 e 7 => largura do canvas sobre a largura do alien
  // dividir o canvas em 8 colunas para o posicionamento aleatorio do alien
  const alienPosition = (Math.floor(Math.random() * 8)) * 50

  const alien = new Alien(30, 0, 50, 50, alienPosition, -50)
  alien.vy = 1

  // otimização do alien
  if (Math.floor(Math.random() * 11) > 7) {
    alien.state = alien.CRAZY
    alien.vx = 2
  }

  if (Math.floor(Math.random() * 11) > 5) {
    alien.vy = 2
  }

  sprites.push(alien)
  aliens.push(alien)
}

// destroi alien
function destroyAlien (alien) {
  alien.state = alien.EXPLODED
  alien.explode()
  playSound(EXPLOSION)
  setTimeout(function () {
    removeObjects(alien, aliens)
    removeObjects(alien, sprites)
  }, 1000)
}

// remove os objetos do jogo

function removeObjects (objsctToRemove, array) {
  const i = array.indexOf(objsctToRemove)
  if (i !== -1) {
    array.splice(i, 1)
  }
}

// atualização do placar
function updateScore () {
  // calculo do aproveitamento
  if (shots === 0) {
    acurary = 100
  } else {
    acurary = Math.floor((hits / shots) * 100)
  }
  // ajuste no texto do aproveitamento
  if (acurary < 100) {
    acurary = acurary.toString()
    if (acurary.length < 2) {
      acurary = '  ' + acurary
    } else {
      acurary = ' ' + acurary
    }
  }
  // ajuste no texto do hits
  hits = hits.toString()
  if (hits.length < 2) {
    hits = '0' + hits
  }
  scoreMessage.text = 'HITS:  ' + hits + '        ACURACY:  ' + acurary + ' %'
}

// função de game over
function endGame () {
  if (hits < scoreTowin) {
    gameOverMessage.text = 'EARTH DESTROYED!'
  } else {
    gameOverMessage.text = 'EARTH SAVED!'
    gameOverMessage.color = '#00f'
  }
  gameOverMessage.visible = true
  setTimeout(function () {
    location.reload()
  }, 3000)
}

// efeitos sonoros do jogo
function playSound (soundType) {
  const sound = document.createElement('audio')
  if (soundType === EXPLOSION) {
    sound.src = './sound/explosion.mp3'
  } else {
    sound.src = './sound/plama-shot.wav'
  }
  sound.addEventListener('canplaythrough', function () {
    sound.play()
  }, false)
}

function render () {
  ctx.clearRect(0, 0, cnv.width, cnv.height)
  // exibe os sprites
  if (sprites.length !== 0) {
    for (const i in sprites) {
      const spr = sprites[i]
      ctx.drawImage(img, spr.sourceX, spr.sourceY, spr.width, spr.height, Math.floor(spr.x), Math.floor(spr.y), spr.width, spr.height)
    }
  }
  // exibe os textos
  if (messages.length != 0) {
    for (const i in messages) {
      const message = messages[i]
      if (message.visible) {
        ctx.font = message.font
        ctx.fillStyle = message.color
        ctx.textBaseline = message.baseline
        message.x = (cnv.width - ctx.measureText(message.text).width) / 2
        ctx.fillText(message.text, message.x, message.y)
      }
    }
  }
}

loop()
