const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
const playerShip = document.getElementById('playerShip')
const bulletImg = document.getElementById('bulletImg')
const enemyShip = document.getElementById('enemyShip')
const particleImg = document.getElementById('particles')
const scoreKeeper = document.querySelector('#scoreKeeper')
const startGameBtn = document.querySelector('#startGameBtn')
const gameStarter = document.querySelector('#gameStarter')
const finalScore = document.querySelector('#finalScore')
const gameResumer = document.querySelector('#gameResumer')
const resumeGameBtn = document.querySelector('#resumeGameBtn')
const welcomeScreen = document.querySelector('#welcomeScreen')
const highScoreKeeper = document.querySelector('#highScoreKeeper')
const highScoreDisplayer = document.querySelector('#highScoreDisplayer')

canvas.width = window.innerWidth - 5
canvas.height = window.innerHeight - 5

class player {
    constructor(x, y) {
        this.x = x
        this.y = y
    }

    drawPlayer() {
        ctx.drawImage(playerShip, this.x, this.y, 75, 75)
    }
}

class bullet {
    constructor(x, y) {
        this.x = x
        this.y = y
    }

    drawBullet() {
        ctx.drawImage(bulletImg, this.x, this.y)
    }

    shoot() {
        this.drawBullet()
        this.y -= 6
    }
}

class enemy {
    constructor(x, y, span, tilt) {
        this.x = x
        this.y = y
        this.span = span
        this.tilt = tilt
    }

    drawEnemy() {
        ctx.drawImage(enemyShip, this.x, this.y, this.span, this.span)
    }

    enter() {
        this.drawEnemy()
        this.y += 5
        if ((this.tilt >= canvas.width*3/4) || (this.tilt >= canvas.width/4 && this.tilt <= canvas.width/2)) {
            this.x -= 2
        }
        else if ((this.tilt < canvas.width/4) || (this.tilt > canvas.width/2 && this.tilt < canvas.width*3/4)) {
            this.x += 2
        }
    }
} 

class particle {
    constructor(x, y, span, xspeed, yspeed) {
        this.x = x
        this.y = y
        this.span = span
        this.xspeed = xspeed
        this.yspeed = yspeed
        this.alpha = 1
    }

    drawParticle() {
        ctx.save()
        ctx.globalAlpha = this.alpha
        if (Math.random() > 0.4) {
            ctx.drawImage(particleImg, this.x, this.y, this.span, this.span)
        } else {
            ctx.drawImage(enemyShip, this.x, this.y, this.span, this.span)
        }
        ctx.restore()
    }

    moveParticle() {
        this.drawParticle()
        this.xspeed *= 0.98
        this.yspeed *= 0.98
        this.x += this.xspeed
        this.y += this.yspeed
        this.alpha -= 0.01
    }
} 

var x = canvas.width/2 - 30
const y = canvas.height - 100
const player1 = new player(x, y)
player1.drawPlayer()

var LEFT = false 
var RIGHT = false
function move() {
    if (player1.x < canvas.width - 75 && player1.x > 0) {
        if(LEFT) { 
            player1.x -= 6
        }
        if(RIGHT) {
            player1.x += 6
        }
    }
	if (player1.x > canvas.width - 75) {
        if(LEFT) { 
            player1.x -= 6
        }
        if(RIGHT) {
            player1.x += 0
        }
    }
    if (player1.x < 0) {
        if(LEFT) { 
            player1.x -= 0
        }
        if(RIGHT) {
            player1.x += 6	
        }
    }
}
document.onkeydown = function(e) {
	if(e.keyCode == 37) LEFT = true
	if(e.keyCode == 39) RIGHT = true
}
document.onkeyup = function(e) {
	if(e.keyCode == 37) LEFT = false
	if(e.keyCode == 39) RIGHT = false
}
setInterval (update, 10)
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    player1.drawPlayer()   
    move()
}

let bullets = []
let enemies = []
let particles = []

function init() {
    bullets = []
    enemies = []
    particles = []
    score = 0
    scoreKeeper.innerHTML = score
    finalScore.innerHTML = score
}

function enterEnemy() {
    setInterval(() => {
        spawnLoc = canvas.width * Math.random()        
        span = (Math.random() * 45) + 40
        enemies.push(new enemy(spawnLoc, -50, span, spawnLoc))
    }, 2500)
    setTimeout(() => {enterEnemy()}, 75000)
}

let animationId
let score = 0
let highscore = 0
function animate() {
    animationId = requestAnimationFrame(animate)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    player1.drawPlayer()
    particles.forEach((particle1, particleIndex) => {
        if (particle1.alpha <= 0) {
            particles.splice(particleIndex, 1)
        } else {
            particle1.moveParticle()
        }
    })
    bullets.forEach((bullet1, bulletIndex2) => {
        bullet1.shoot()
        if (bullet1.y < 0) {
            setTimeout(() => {
                bullets.splice(bulletIndex2, 1)
            }, 0)
        }
    })
    enemies.forEach((enemy1, enemyIndex) => {
        enemy1.enter()
        if (enemy1.y > canvas.height) {
            setTimeout(() => {
                enemies.splice(enemyIndex, 1)
            }, 0)
        }

        const crashDist = Math.abs(player1.y - enemy1.y)
        if (crashDist < 5 && player1.x < enemy1.x + span && player1.x + 75 > enemy1.x) {
            cancelAnimationFrame(animationId)
            gameStarter.style.display = 'flex'
            finalScore.innerHTML = score
            highScoreDisplayer.innerHTML = "Highscore: " + highscore
        }

        bullets.forEach((bullet2, bulletIndex) => {
            const dist = Math.abs((bullet2.y - 25) - enemy1.y)
            if ((bullet2.x > (enemy1.x - 6)) && ((bullet2.x - 6) < (enemy1.x + span)) && (dist < 7)) {
                for (let i = 0; i < enemy1.span/4; i++) {
                    particles.push(new particle(bullet2.x, bullet2.y, Math.random()*20, (Math.random() - 0.5)*(Math.random()*20), (Math.random() - 0.5)*(Math.random()*20)))
                }
                if (enemy1.span > 60) {
                    score += 10
                    scoreKeeper.innerHTML = score
                    if (score > highscore) {
                        highscore = score
                    }
                    highScoreKeeper.innerHTML = "Highscore: " + highscore 
                    gsap.to(enemy1, {
                        span: enemy1.span - 20
                    })
                    setTimeout(() => {
                        bullets.splice(bulletIndex, 1)
                    }, 0)
                } else {
                    score += 20
                    scoreKeeper.innerHTML = score
                    if (score > highscore) {
                        highscore = score
                    }
                    highScoreKeeper.innerHTML = "Highscore: " + highscore
                    setTimeout(() => {
                        enemies.splice(enemyIndex, 1)
                        bullets.splice(bulletIndex, 1)
                    }, 0)
                }
                
            }
        })
    })
}

welcomeScreen.style.display = 'flex'
gameStarter.style.display = 'none'
gameResumer.style.display = 'none'

window.addEventListener('click', () => {
    bullets.push(new bullet(player1.x + 31.5, player1.y))
})

window.addEventListener('keydown', function(event){
	if(event.key === "Escape"){
		gameResumer.style.display = 'flex'
        cancelAnimationFrame(animationId)
        
	}
});

resumeGameBtn.addEventListener('click', () => {
    animate()
    gameResumer.style.display = 'none'
    gameStarter.style.display = 'none'
})

startGameBtn.addEventListener('click', () => {
    init()
    animate()
    enterEnemy()
    gameStarter.style.display = 'none'
    gameResumer.style.display = 'none'
    welcomeScreen.style.display = 'none'
})

restartGameBtn.addEventListener('click', () => {
    init()
    animate()
    gameStarter.style.display = 'none'
    gameResumer.style.display = 'none'
})