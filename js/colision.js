function collide (s1, s2) {
  let hit = false

  // calcula a distancia entre o centro dos sprites
  const vetX = s1.centerX() - s2.centerX()
  const vetY = s1.centerY() - s2.centerY()

  // armazenar as somas das metades dos sprites na largura e altura
  const sumHalfWidth = s1.halfWidth() + s2.halfWidth()
  const sumHalfHeight = s1.halfHeight() + s2.halfHeight()

  // verifica se houve colisão
  if (Math.abs(vetX) < sumHalfWidth && Math.abs(vetY) < sumHalfHeight) {
    hit = true
  }

  return hit
}
