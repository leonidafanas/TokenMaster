const { expect } = require("chai")

const NAME = "TokenMaster"
const SYMBOL = "TM"

const OCCASION_NAME = "ETH Texas"
const OCCASION_COST = ethers.utils.parseUnits('1', 'ether')
const OCCASION_MAX_TICKETS = 100
const OCCASION_DATE = "Apr 24"
const OCCASION_TIME = "1:00AM"
const OCCASION_LOCATION = "Austin, Texas"


describe("TokenMaster", () => {
  let TokenMaster // declared but accessable only within function scope -> within {}
  let deployer, buyer

  beforeEach(async() => {
    //Setup accounts
    [deployer, buyer] = await ethers.getSigners()

    const TokenMaster = await ethers.getContractFactory("TokenMaster") //TokenMaster becomes const thus cannot be changed
    tokenMaster = await TokenMaster.deploy(NAME, SYMBOL) //tokenMaster without 'let' to be accessable outside of function/block -> in 'it's subfunctions
    
    const transaction = await tokenMaster.connect(deployer).list(
      OCCASION_NAME,
      OCCASION_COST,
      OCCASION_MAX_TICKETS,
      OCCASION_DATE,
      OCCASION_TIME,
      OCCASION_LOCATION
    )

      await transaction.wait()
  })

  describe("Deployment", () => {
    it("Sets the name", async() => {
      expect(await tokenMaster.name()).to.equal(NAME)
    })

    it("Sets the symbol", async() => {
      expect(await tokenMaster.symbol()).to.equal(SYMBOL)
    })

    it("Sets the owner", async() => {
      expect(await tokenMaster.owner()).to.equal(deployer.address) //owner = address of signer who deployed (= sent msg) this contract per constructor in solidity filer and thus is the first address in [deployer, buyer] -> 'deployer 

    })
  
  })

  describe("Occasions", () => {
    it('Updates occasions count', async() => {
      const totalOccasions = await tokenMaster.totalOccasions()
      expect(totalOccasions).to.be.equal(1)
    })

    it('Returns occasions attributes', async() => {
      const occasion = await tokenMaster.getOccasion(1)
      expect(occasion.id).to.be.equal(1)
      expect(occasion.name).to.be.equal(OCCASION_NAME)
      expect(occasion.cost).to.be.equal(OCCASION_COST)
      expect(occasion.tickets).to.be.equal(OCCASION_MAX_TICKETS)
      expect(occasion.date).to.be.equal(OCCASION_DATE)
      expect(occasion.time).to.be.equal(OCCASION_TIME)
      expect(occasion.location).to.be.equal(OCCASION_LOCATION)
    })
  })

  describe("Minting", () => {
    const ID = 1
    const SEAT = 50
    const AMOUNT = ethers.utils.parseUnits('1', 'ether')

  beforeEach(async () => {
    const transaction = await tokenMaster.connect(buyer).mint(ID, SEAT, { value: AMOUNT })
    await transaction.wait()
  })

  it('Updates ticket count', async () => {
    const occasion = await tokenMaster.getOccasion(1)
    expect(occasion.tickets).to.be.equal(OCCASION_MAX_TICKETS - 1)
      })
  it('Updates buying status', async () => {
    const status = await tokenMaster.hasBought(ID, buyer.address)
    expect(status).to.be.equal(true)
      })
  it('Assignes seat to sender of function', async () =>{
    const takenSeat = await tokenMaster.seatTaken(ID, SEAT)
    expect(takenSeat).to.be.equal(buyer.address)
      })
  it('Updates overall seating status', async () => {
    const seats = await tokenMaster.getSeatsTaken(ID)
    expect(seats.length).to.be.equal(1)
    expect(seats[0]).to.be.equal(SEAT)
      })
  it('Updates the contract balance', async () =>{
    const balance = await ethers.provider.getBalance(tokenMaster.address)
    expect(balance).to.be.equal(AMOUNT)
  })

})

   describe("Withdrawing", () =>{
    const ID = 1
    const SEAT = 50
    const AMOUNT = ethers.utils.parseUnits("1", 'ether')
    let balanceBefore

    beforeEach(async() =>{
      balanceBefore = await ethers.provider.getBalance(deployer.address)
      let transaction = await tokenMaster.connect(buyer).mint(ID, SEAT, {value: AMOUNT})
      await transaction.wait()

      transaction = await tokenMaster.connect(deployer).withdraw()
      await transaction.wait()
    })
    it('Updates the owner balance', async() =>{
      const balanceAfter = await ethers.provider.getBalance(deployer.address)
      expect(balanceAfter).to.be.greaterThan(balanceBefore)
    })
    it('Updates contract balance', async() =>{
      const balance = await ethers.provider.getBalance(tokenMaster.address)
      expect(balance).to.equal(0)
    })

  })

 }) 




