let iotaaddress
wasm.wasmmodule.then(r => iotaaddress = r)

let addresses = []

function generateAddress() {
  let seed = document.getElementById('seed').value
  let secLvl = document.getElementById('secLvl').value
  let checksum = JSON.parse(document.getElementById('checksum').value)
  let index = document.getElementById('index').value || 0
  let address = iotaaddress.generate_address(seed, index, secLvl, checksum)
  addAddressElement(index, address)
}

async function generateAddresses() {
  document.getElementById("status").innerText = 'Generating addresses...'
  //timeout to let it update before generating the addresses
  await new Promise(resolve => setTimeout(resolve, 1));
  let addr = await gen()
  document.getElementById("status").innerHTML = ''
  return addr
}
async function gen() {
  let seed = document.getElementById('seed').value
  let secLvl = document.getElementById('secLvl').value
  let checksum = JSON.parse(document.getElementById('checksum').value)
  let startIndex = document.getElementById('startIndex').value || 0
  let endIndex = document.getElementById('endIndex').value || 1
  let addresses = await iotaaddress.generate_addresses(seed, startIndex, endIndex, secLvl, checksum)
  for (let [i, address] of addresses.entries()) {
    let index = parseInt(startIndex) + i
    addAddressElement(index, address)
  }
  return addresses
}

function addAddressElement(index, address) {
  addresses.push(address.slice(0, 81))
  let addressElement = document.createElement("addressElement");
  addressElement.innerHTML = "<pre>" + index.toString().padStart(4, " ") + ': ' + address + ' <a href="https://explorer.iota.org/mainnet/address/' + address + '" target="_blank" rel="noopener noreferrer">explorer</a><br>'
  document.getElementById("addresses").append(addressElement);
}

function clearAddresses() {
  addresses = []
  document.getElementById("addresses").innerHTML = ''
}

function getBalance() {
  let node = document.getElementById('node').value
  let iota = core.composeAPI({
    provider: node
  })
  iota.getBalances(addresses, 100)
    .then(({ balances }) => {
      let balance = balances.reduce((a, b) => a + b)
      document.getElementById("balance").innerHTML = 'Balance: ' + balance + 'i'
      console.log('Balance: ' + balance + 'i')
      let seed = document.getElementById('seed').value
      let secLvl = document.getElementById('secLvl').value
      let startIndex = document.getElementById('startIndex').value || 0
      let endIndex = document.getElementById('endIndex').value || 1
      console.log("With seed: " + seed + " sec: " + secLvl + " start: " + startIndex + " end: " + endIndex);
    })
    .catch(err => {
      console.log(err)
    })
}

async function send_all_iotas() {
  try {
    let node = document.getElementById('node').value
    let mwm = Number.parseInt(document.getElementById('mwm').value)
    let seed = document.getElementById('seed').value
    let sec_lvl = Number.parseInt(document.getElementById('secLvl').value)
    let startIndex = Number.parseInt(document.getElementById('startIndex').value) || 0
    let destination_address = document.getElementById('destination_address').value.trim()
    let iota = core.composeAPI({
      provider: node
    })
    if (!checksum.isValidChecksum(destination_address)) {
      console.error("Invalid destination_address");
      document.getElementById("status").innerText = "Invalid destination_address"
      return
    }
    let addresses = await generateAddresses()
    let balances = await addresses_with_balance(addresses)
    let total_balance = balances.reduce((a, b) => {
      return a + b;
    })

    // if (total_balance <= 0) {
    //   console.error("No iotas found");
    //   document.getElementById("status").innerText = "No iotas found"
    //   return
    // }

    let transfers = [{
      value: total_balance,
      address: destination_address
    }]

    let options = {
      'inputs': []
    }

    for (let k = 0; k < balances.length; k++) {
      if (balances[k] > 0) {
        options.inputs.push({
          address: addresses[k],
          keyIndex: k + startIndex,
          balance: balances[k],
          security: sec_lvl
        })
      }
    }
    console.log(options.inputs);

    let trytes = await iota.prepareTransfers(seed, transfers, options)
    let bundle = await iota.sendTrytes(trytes, 3, mwm)
    console.log('Transfer sent: https://explorer.iota.org/mainnet/transaction/' + bundle[0].hash)
    document.getElementById("status").innerHTML = '<a href="https://explorer.iota.org/mainnet/transaction/' + bundle[0].hash + '" target="_blank" rel="noopener noreferrer">Transaction sent</a>'
    async function addresses_with_balance(addresses) {
      let res = await iota.getBalances(addresses, 100)
      return res.balances
    }
  } catch (err) {
    document.getElementById("status").innerText = err
    console.error(err)
  }
}
