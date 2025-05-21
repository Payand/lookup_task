const fs = require('fs');

function convertIpToBinary(ip) {
  return ip.split('.')
    .map(oct => parseInt(oct, 10).toString(2).padStart(8, '0'))
    .join('');
}


function readFileAndParse() {
  const lines = fs.readFileSync('./ranges.txt', 'utf-8')
    .split('\n')
    .filter(Boolean);
  return lines.map(line => {
    const [ipCidr, isp, as, country] = line.split(',').map(chunk => chunk.trim());
    return {
      ipCidr,
      isp,
      as,
      country
    };
  });
}


function trieBuilder(ranges) {
  const root = {};

  for (const range of ranges) {
    const [rangeIp, prefixLengthStr] = range.ipCidr.split('/');
    const prefixLength = parseInt(prefixLengthStr, 10);
    const binaryIp = convertIpToBinary(rangeIp).slice(0, prefixLength);
    let node = root;
    
    for (const bit of binaryIp) {
      if (!node[bit]) node[bit] = {};
      node = node[bit];
    }
    node.range = range;
  }
  return root;
}


function traverseTrie(ip, trieRoot) {
  const binaryIp = convertIpToBinary(ip);
  let current = trieRoot;
  let lastMatch = null;

  for (const bit of binaryIp) {
    if (current.range) lastMatch = current.range;
    if (!current[bit]) break;
    current = current[bit];

  }

  return lastMatch || "No matching range found";
}


const ranges = readFileAndParse();
const trie = trieBuilder(ranges);

// =============== TEST CASES ===================

// SINGLE MATCH
const ip = "1.0.0.1";
const result = traverseTrie(ip, trie);
console.log(`============= BEST MATCH FOR ${ip} =============`);
console.log(result);

// MULTIPLE MATCHES
const ip2 = "1.24.10.50";
const result2 = traverseTrie(ip2, trie);
console.log(`============= BEST MATCH FOR ${ip2} =============`);
console.log(result2);

// NO MATCHING
const ip3 = "203.0.113.1";
const result3 = traverseTrie(ip3, trie);
console.log(`============= BEST MATCH FOR ${ip3} =============`);
console.log(result3);


