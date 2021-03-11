'use strict'

Array.prototype.last = function () {return this[this.length - 1]}
class Game2048 {
  constructor (selector='body', name='game-container') {
    this.selector = selector
    this.name = name
    this.tiles = document.querySelector('.tiles')
    this.data = JSON.parse(localStorage.getItem('data2048')) || []
    if (window.innerWidth < 405) {
      this.tileKoef = 90
    } else this.tileKoef = 97.5
    
    this.best = localStorage.getItem('best2048') || 0
    this.score = localStorage.getItem('score2048') || 0
    }
  
  touchPos = {
    startX: null,
    startY: null,
    x: null,
    y: null,
  }

  await = false

  cellTypes = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048]

  getRandomInRange(max) {
    return Math.floor(Math.random() * (max + 1))
  }

  async createTile(init) {
    if (init) {
      let tile = {
        x: this.getRandomInRange(3),
        y: this.getRandomInRange(3),
        val: this.getRandomInRange(1)? 4 : 2,
        id: Date.now().toString()
      }

      this.data = []
      this.data.push(tile)

      let secondTile = {
        x: this.getRandomInRange(3),
        y: this.getRandomInRange(3), 
        val: this.getRandomInRange(1)? 4 : 2,
        id: (Date.now()+1).toString()
      }

      while (tile.x === secondTile.x && tile.y === secondTile.y) {
        secondTile = {
          x: this.getRandomInRange(3),
          y: this.getRandomInRange(3),
          val: this.getRandomInRange(1)? 4 : 2,
          id: (Date.now()+1).toString()
        }
      }

      this.data.push(secondTile)
      localStorage.setItem('data2048', JSON.stringify(this.data))
      return
    }

    let tile = {
      x: this.getRandomInRange(3),
      y: this.getRandomInRange(3),
      val: this.getRandomInRange(1)? 4 : 2,
      id: Date.now().toString()+'q'
    }

    let isNew = true
    
      this.data.forEach(el => el.x===tile.x && el.y===tile.y? isNew =false:'')
    
    if (isNew === false && this.data.length>=16) {
      let canBeMoved = false

      if (this.tryMoveLeft()) canBeMoved = true
      if (this.tryMoveRight()) canBeMoved = true
      if (this.tryMoveUp()) canBeMoved = true
      if (this.tryMoveDown()) canBeMoved = true

      if (canBeMoved) return

      this.data = []
      this.tiles.innerHTML = ``
      this.createTile(true)
      this.renderTiles()
      alert('GAME OVER')
      return
    }
    if (!isNew) {
      this.createTile()
      return
    }
    this.data.push(tile)

    return await tile
  }
  
  renderTiles() {
    this.data.forEach(tile => {
      let tileElement = document.createElement('div')
      tileElement.innerHTML = `<div class="tile-inner">
        ${tile.val} 
      </div>` 
      tileElement.style.top = `${tile.y * this.tileKoef}px`
      tileElement.style.left = `${tile.x * this.tileKoef}px`      
      tileElement.classList = 'tile s' + this.cellTypes.indexOf(tile.val)
      tileElement.dataset.id = tile.id
      
      this.tiles.appendChild(tileElement)
    })
  }

  moveLeft = (state, tile, willRemoved) => {
    if (tile.x === 0) {
      state.push(tile)
    } else {
      if (!state.length) {
        tile.x = tile.x-1
        state.push(tile)
        return
      }
      if (state.last().x === tile.x-1) {
        if (state.last().val === tile.val 
        && !state.last().isMerged && !tile.isMerged) {
          state.last().val = state.last().val*2
          state.last().isMerged = true
          state.last().mergedInLast = true
          tile.x = tile.x -1
          willRemoved.push(tile)
        } else {
          state.push(tile)  
        }
      } else {
        tile.x = tile.x-1
        state.push(tile)
      }
    }
  }

  moveRight = (state, tile, willRemoved) => {
    if (tile.x === 3) {
      state.push(tile)
    } else {
      if (!state.length) {
        tile.x = tile.x+1
        state.push(tile)
        return
      }
      if (state.last().x === tile.x+1) {
        if (state.last().val === tile.val 
        && !state.last().isMerged && !tile.isMerged) {
          state.last().val = state.last().val*2
          state.last().isMerged = true
          state.last().mergedInLast = true
          tile.x = tile.x+1
          willRemoved.push(tile)
        } else {
          state.push(tile)  
        }
      } else {
        tile.x = tile.x+1
        state.push(tile)
      }
    }
  }

  moveDown = (state, tile, willRemoved) => {
    if (tile.y === 3) {
      state.push(tile)
    } else {
      if (!state.length) {
        tile.y = tile.y+1
        state.push(tile)
        return
      }
      if (state.last().y === tile.y+1) {
        if (state.last().val === tile.val 
        && !state.last().isMerged && !tile.isMerged) {
          state.last().val = state.last().val*2
          state.last().isMerged = true
          state.last().mergedInLast = true
          tile.y = tile.y+1
          willRemoved.push(tile)
        } else {
          state.push(tile)  
        }
      } else {
        tile.y = tile.y+1
        state.push(tile)
      }
    }
  }

  moveUp = (state, tile, willRemoved) => {
    if (tile.y === 0) {
      state.push(tile)
    } else {
      if (!state.length) {
        tile.y = tile.y-1
        state.push(tile)
        return
      }
      if (state.last().y === tile.y-1) {
        if (state.last().val === tile.val 
        && !state.last().isMerged && !tile.isMerged) {
          state.last().val = state.last().val*2
          state.last().isMerged = true
          state.last().mergedInLast = true
          tile.y = tile.y -1
          willRemoved.push(tile)
        } else {
          state.push(tile)  
        }
      } else {
        tile.y = tile.y-1
        state.push(tile)
      }
    }
  }

  tryMoveLeft() {
    let willRemoved = []
    let newData = []
    let rows = [[], [], [], []]
    this.data.forEach( tile => rows[tile.y].push({
      x: tile.x,
      y: tile.y,
      val: tile.val,
      id: tile.id,
    }))
    rows = rows.filter(row => row.length)
    rows.map(row=> row.sort((a, b) => {
      if (a.x < b.x) return -1
      if (a.x > b.x) return 1
      return 0;
    }))

    rows.forEach(row => {
      let st0 = row
      let st1 = []
      let st2 = []
      let st3 = []
      let st4 = []
      let st5 = []

      st0.forEach( tile => this.moveLeft(st1, tile, willRemoved))
      st1.forEach( tile => this.moveLeft(st2, tile, willRemoved))
      st2.forEach( tile => this.moveLeft(st3, tile, willRemoved))
      st3.forEach( tile => this.moveLeft(st4, tile, willRemoved))
      st4.forEach( tile => this.moveLeft(st5, tile, willRemoved))

      newData = [...newData, ...st5]
    })

    if (this.data.length> newData.length) return true
    return false
  }

  tryMoveRight() {
    let willRemoved = []
    let newData = []
    let rows = [[], [], [], []]
    this.data.forEach( tile => rows[tile.y].push({
      x: tile.x,
      y: tile.y,
      val: tile.val,
      id: tile.id,
    }))
    rows = rows.filter(row => row.length)
    rows.map(row=> row.sort((a, b) => {
      if (a.x > b.x) return -1
      if (a.x < b.x) return 1
      return 0;
    }))
    
    rows.forEach(row => {
      let st0 = row
      let st1 = []
      let st2 = []
      let st3 = []
      let st4 = []
      let st5 = []

      st0.forEach( tile => this.moveRight(st1, tile, willRemoved))
      st1.forEach( tile => this.moveRight(st2, tile, willRemoved))
      st2.forEach( tile => this.moveRight(st3, tile, willRemoved))
      st3.forEach( tile => this.moveRight(st4, tile, willRemoved))
      st4.forEach( tile => this.moveRight(st5, tile, willRemoved))

      newData = [...newData, ...st5]
    })

    if (this.data.length> newData.length) return true
    return false
  }
  
  tryMoveDown() {
    let willRemoved = []
    let newData = []
    let cols = [[], [], [], []]
    this.data.forEach( tile => cols[tile.x].push({
      x: tile.x,
      y: tile.y,
      val: tile.val,
      id: tile.id,
    }))
    cols = cols.filter(col => col.length)
    cols.map(col=> col.sort((a, b) => {
      if (a.y > b.y) return -1
      if (a.y < b.y) return 1
      return 0;
    }))
    
    cols.forEach(col => {
      let st0 = col
      let st1 = []
      let st2 = []
      let st3 = []
      let st4 = []
      let st5 = []

      st0.forEach( tile => this.moveDown(st1, tile, willRemoved))
      st1.forEach( tile => this.moveDown(st2, tile, willRemoved))
      st2.forEach( tile => this.moveDown(st3, tile, willRemoved))
      st3.forEach( tile => this.moveDown(st4, tile, willRemoved))
      st4.forEach( tile => this.moveDown(st5, tile, willRemoved))

      newData = [...newData, ...st5]
    })

    if (this.data.length> newData.length) return true
    return false
  }

  tryMoveUp() {
    let willRemoved = []
    let newData = []
    let cols = [[], [], [], []]
    this.data.forEach( tile => cols[tile.x].push({
      x: tile.x,
      y: tile.y,
      val: tile.val,
      id: tile.id,
    }))
    cols = cols.filter(col => col.length)
    cols.map(col=> col.sort((a, b) => {
      if (a.y < b.y) return -1
      if (a.y > b.y) return 1
      return 0;
    }))
    
    cols.forEach(col => {
      let st0 = col
      let st1 = []
      let st2 = []
      let st3 = []
      let st4 = []
      let st5 = []

      st0.forEach( tile => this.moveUp(st1, tile, willRemoved))
      st1.forEach( tile => this.moveUp(st2, tile, willRemoved))
      st2.forEach( tile => this.moveUp(st3, tile, willRemoved))
      st3.forEach( tile => this.moveUp(st4, tile, willRemoved))
      st4.forEach( tile => this.moveUp(st5, tile, willRemoved))

      newData = [...newData, ...st5]
    })

    if (this.data.length> newData.length) return true
    return false
  }

  moveTiles = async (e) => {
    let willRemoved = []
    let newData = []

    if (e.code === 'KeyA') { // move to left 
      let rows = [[], [], [], []]
      this.data.forEach( tile => rows[tile.y].push({
        x: tile.x,
        y: tile.y,
        val: tile.val,
        id: tile.id,
      }))
      rows = rows.filter(row => row.length)
      rows.map(row=> row.sort((a, b) => {
        if (a.x < b.x) return -1
        if (a.x > b.x) return 1
        return 0;
      }))

      rows.forEach(row => {
        let st0 = row
        let st1 = []
        let st2 = []
        let st3 = []
        let st4 = []
        let st5 = []

        st0.forEach( tile => this.moveLeft(st1, tile, willRemoved))
        st1.forEach( tile => this.moveLeft(st2, tile, willRemoved))
        st2.forEach( tile => this.moveLeft(st3, tile, willRemoved))
        st3.forEach( tile => this.moveLeft(st4, tile, willRemoved))
        st4.forEach( tile => this.moveLeft(st5, tile, willRemoved))

        newData = [...newData, ...st5]
      })
    }

    if (e.code === 'KeyD') { // move to right 
      let rows = [[], [], [], []]
      this.data.forEach( tile => rows[tile.y].push({
        x: tile.x,
        y: tile.y,
        val: tile.val,
        id: tile.id,
      }))
      rows = rows.filter(row => row.length)
      rows.map(row=> row.sort((a, b) => {
        if (a.x > b.x) return -1
        if (a.x < b.x) return 1
        return 0;
      }))
      
      rows.forEach(row => {
        let st0 = row
        let st1 = []
        let st2 = []
        let st3 = []
        let st4 = []
        let st5 = []

        st0.forEach( tile => this.moveRight(st1, tile, willRemoved))
        st1.forEach( tile => this.moveRight(st2, tile, willRemoved))
        st2.forEach( tile => this.moveRight(st3, tile, willRemoved))
        st3.forEach( tile => this.moveRight(st4, tile, willRemoved))
        st4.forEach( tile => this.moveRight(st5, tile, willRemoved))

        newData = [...newData, ...st5]
      })
    }

    if (e.code === 'KeyS') { // move to down 
      let cols = [[], [], [], []]
      this.data.forEach( tile => cols[tile.x].push({
        x: tile.x,
        y: tile.y,
        val: tile.val,
        id: tile.id,
      }))
      cols = cols.filter(col => col.length)
      cols.map(col=> col.sort((a, b) => {
        if (a.y > b.y) return -1
        if (a.y < b.y) return 1
        return 0;
      }))
      
      cols.forEach(col => {
        let st0 = col
        let st1 = []
        let st2 = []
        let st3 = []
        let st4 = []
        let st5 = []

        st0.forEach( tile => this.moveDown(st1, tile, willRemoved))
        st1.forEach( tile => this.moveDown(st2, tile, willRemoved))
        st2.forEach( tile => this.moveDown(st3, tile, willRemoved))
        st3.forEach( tile => this.moveDown(st4, tile, willRemoved))
        st4.forEach( tile => this.moveDown(st5, tile, willRemoved))

        newData = [...newData, ...st5]
      })
    }
    
    if (e.code === 'KeyW') { // move to up 
      let cols = [[], [], [], []]
      this.data.forEach( tile => cols[tile.x].push({
        x: tile.x,
        y: tile.y,
        val: tile.val,
        id: tile.id,
      }))
      cols = cols.filter(col => col.length)
      cols.map(col=> col.sort((a, b) => {
        if (a.y < b.y) return -1
        if (a.y > b.y) return 1
        return 0;
      }))
      
      cols.forEach(col => {
        let st0 = col
        let st1 = []
        let st2 = []
        let st3 = []
        let st4 = []
        let st5 = []

        st0.forEach( tile => this.moveUp(st1, tile, willRemoved))
        st1.forEach( tile => this.moveUp(st2, tile, willRemoved))
        st2.forEach( tile => this.moveUp(st3, tile, willRemoved))
        st3.forEach( tile => this.moveUp(st4, tile, willRemoved))
        st4.forEach( tile => this.moveUp(st5, tile, willRemoved))

        newData = [...newData, ...st5]
      })
    }

    this.data = [...newData]
    return await newData, willRemoved 
  }

  handlerKeydown = (e) => {
    let willRemoved = []
    this.moveTiles(e).then(r => {
      
      willRemoved = [...r]
    
      willRemoved.forEach(del => {
        let tileElement = this.tiles.querySelector(`[data-id="${del.id}"]`)
        if (!tileElement) return
        tileElement.style.top = `${del.y * this.tileKoef}px`
        tileElement.style.left = `${del.x * this.tileKoef}px` 
        tileElement.classList = 'tile s' + this.cellTypes.indexOf(del.val*2)
        setTimeout(()=> {
          tileElement.style.opacity = `0`
          this.tiles.querySelector(`[data-id="${del.id}"]`).remove()
        }, 200)
      })
      this.data.length? localStorage.setItem('data2048', JSON.stringify(this.data)):''

      this.createTile().then(rep => {
        this.data.forEach(tile => {
          if (this.tiles.querySelector(`[data-id="${tile.id}"]`)) {
            let tileElement = this.tiles.querySelector(`[data-id="${tile.id}"]`)
            tileElement.querySelector('.tile-inner').innerHTML = `${tile.val}` 
            tileElement.style.top = `${tile.y * this.tileKoef}px`
            tileElement.style.left = `${tile.x * this.tileKoef}px`      
            tileElement.classList = 'tile s' + this.cellTypes.indexOf(tile.val)
            if (tile.mergedInLast === true) {
              tileElement.style.transform = `scale(1.2)`        
              setTimeout(()=> {
                tileElement.style.transform = `scale(1)`
              }, 50)
              tile.mergedInLast === true
            }
          } else {
            let tileElement = document.createElement('div')
            tileElement.innerHTML = `<div class="tile-inner">
              ${tile.val} 
            </div>` 
            tileElement.style.top = `${tile.y * this.tileKoef}px`
            tileElement.style.left = `${tile.x * this.tileKoef}px`      
            tileElement.classList = 'tile s' + this.cellTypes.indexOf(tile.val)
            tileElement.dataset.id = tile.id
            
            this.tiles.appendChild(tileElement)
            tileElement.style.transform = `scale(0.3)`
            
            setTimeout(()=> {
              tileElement.style.transform = `scale(1)`
            }, 50)
          }
        })
      })
    })
  }

  handlerTouchMove = (e) => {
    e.preventDefault()
    this.touchPos.x = e.touches[0].clientX
    this.touchPos.y = e.touches[0].clientY

    if (this.touchPos.startX === null 
    && this.touchPos.startY === null) return

    let module = {
      x: this.touchPos.x - this.touchPos.startX,
      y: this.touchPos.y - this.touchPos.startY
    }

    let fakeEvent = {
      code: null
    }


    if (module.x > 50) {
      fakeEvent.code = 'KeyD'
      this.touchPos.startX = null
      this.touchPos.startY = null
    }
    if (module.x < -50) {
      fakeEvent.code = 'KeyA'
      this.touchPos.startX = null
      this.touchPos.startY = null
    }
    if (module.y > 50) {
      fakeEvent.code = 'KeyS'
      this.touchPos.startX = null
      this.touchPos.startY = null
    }
    if (module.y < -50) {
      fakeEvent.code = 'KeyW'
      this.touchPos.startX = null
      this.touchPos.startY = null
    }

    if (fakeEvent.code !== null) this.handlerKeydown(fakeEvent)
  }

  addHandlers() {
    document.addEventListener('keydown', this.handlerKeydown)
    document.querySelector('.restart').addEventListener('click', () => {
      this.data = []
      this.tiles.innerHTML = ``
      this.createTile(true)
      this.renderTiles()
    })

    document.body.addEventListener('touchmove', e => e.preventDefault())
    
    const grid = document.querySelector('.grid-container')
    document.body.addEventListener('touchstart', e => {
      e.preventDefault()
      this.touchPos.startX = e.touches[0].clientX
      this.touchPos.startY = e.touches[0].clientY
      document.body.addEventListener('touchmove', this.handlerTouchMove)
    })
    document.body.addEventListener('touchend', e => {
      this.touchPos.startX = null
      this.touchPos.startY = null
      document.body.removeEventListener('touchmove', this.handlerTouchMove)
    })

    

    window.addEventListener('resize', e => {
      if (e.target.innerWidth < 405) {
        this.tileKoef = 90
        this.tiles.innerHTML = ``
        this.renderTiles()
      }else {
        this.tileKoef = 97.5
        this.tiles.innerHTML = ``
        this.renderTiles()
      }
    })
  }

  init() {
    if (this.data.length) this.createTile()
    else this.createTile(1)
    this.renderTiles()
    this.addHandlers()
  }
}

const game = new Game2048()
game.init()