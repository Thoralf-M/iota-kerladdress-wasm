let iotaaddress
wasm.wasmmodule.then(r => iotaaddress = r)

// let t1 = Date.now()
// console.log(iotaaddress.generate_addresses('9'.repeat(81), 0, 10, 2, true))
// console.log(Date.now()-t1+" ms")
let addresses = []

function generateAddress() {
  let seed = document.getElementById('seed').value
  let secLvl = document.getElementById('secLvl').value
  let checksum = JSON.parse(document.getElementById('checksum').value)
  let index = document.getElementById('index').value || 0
  let address = iotaaddress.generate_address(seed, index, secLvl, checksum)
  addAddressElement(index, address)
}

function generateAddresses() {
  document.getElementById("status").innerText = 'Generating addresses...'
  //timeout to let it update before generating the addresses
  setTimeout(() => {
    let seed = document.getElementById('seed').value
    let secLvl = document.getElementById('secLvl').value
    let checksum = JSON.parse(document.getElementById('checksum').value)
    let startIndex = document.getElementById('startIndex').value || 0
    let endIndex = document.getElementById('endIndex').value || 1
    let addresses = iotaaddress.generate_addresses(seed, startIndex, endIndex, secLvl, checksum)
    for (let [i, address] of addresses.entries()) {
      let index = parseInt(startIndex) + i
      addAddressElement(index, address)
    }
    document.getElementById("status").innerHTML = ''
  }, 1)
}

function addAddressElement(index, address) {
  addresses.push(address.slice(0, 81))
  let addressElement = document.createElement("addressElement");
  addressElement.innerHTML = "<pre>" + index.toString().padStart(4, " ") + ': ' + address + ' <a href="https://thetangle.org/address/' + address + '" target="_blank" rel="noopener noreferrer">explorer</a><br>'
  document.getElementById("addresses").append(addressElement);
}

function clearAddresses() {
  addresses = []
  document.getElementById("addresses").innerHTML = ''
}

function getBalance() {
  let iota = core.composeAPI({
    provider: 'https://nodes.thetangle.org:443'
  })
  iota.getBalances(addresses, 100)
    .then(({ balances }) => {
      let balance = balances.reduce((a, b) => a + b)
      document.getElementById("balance").innerHTML = 'Balance: ' + balance + 'i'
      console.log('Balance: ' + balance + 'i')
    })
    .catch(err => {
      console.log(err)
    })
}