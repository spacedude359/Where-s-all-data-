var WAD = {
    signature: "",
    numlumps: 0,
    infotableofs: 0,
    lumps: [],
    special_lumps:[]
}

function testbit(v, i) {
    return (v & i) == i;
};

function u8(n) {
    return n & 0xFF;
};

function u16(n) {
    return n & 0xFFFF;
};

function u32(n) {
    return n & 0xFFFFFFFF;
};

function int8(value) {
    value = u8(value);
    let a = (value & 0x80) == 0x80; 
    let b = value & 0x7F;
    return a && -0x80 + b || !a && b;
};

function int16(value) {
    value = u16(value);
    let a = (value & 0x8000) == 0x8000;
    let b =  value & 0x7FFF;
    return a && -0x8000 + b || !a && b;
}; 

function int32(value) {
    value = u32(value);
    let a = (value & 0x80000000) == 0x80000000;
    let b =  value & 0x7FFFFFFF;
    return a && -0x80000000 + b || !a && b;
}; 

function sint32(value) {
    let numbers = value & 0x7FFFFFFF;
    return Math.abs(value) != value && (0^numbers) + 0x80000000 || numbers;
};

function ReadU16(index, address) {
    return (index[address] << 8) | index[address + 1];
};

function ReadU24(index, address) {
    return (index[address] << 16) | (index[address + 1] << 8) | (index[address + 2]);
};

function ReadU32(index, address) {
    return (index[address] << 24) | (index[address + 1] << 16) | (index[address + 2] << 8) | (index[address + 3]);
};

function LEReadU16(index, address) {
    return (index[address + 1] << 8) | index[address];
};

function LEReadU24(index, address) {
    return (index[address + 2] << 16) | (index[address + 1] << 8) | (index[address]);
};

function LEReadU32(index, address) {
    return (index[address + 3] << 24) | (index[address + 2] << 16) | (index[address + 1] << 8) | (index[address]);
};

function exportdata(index, address, size) {
        let s = [];
        for (i=0;i<size;i++) s.push(index[address + i]);
        return s;
}

function ReadString8(index, address) {
        let s = "";
        for (i=0;i<8;i++) s += String.fromCharCode(index[address + i]);
        return s;
}

function BReadU32(index, address) {
    return (index[address] << 24) | (index[address + 1] << 16) | (index[address + 2] << 8) | (index[address + 3]);

};

function ReverseOrder32(value) { 
    return (value & 0xFF000000) >>> 24 | (value & 0xFF0000) >>> 8 | (value & 0xFF00) << 8 | (value & 0xFF) << 24;
};

var input = document.getElementById("file");

function openfile(evt) {
  var files = input.files;
  fileData = new Blob([files[0]]);
  var promise = new Promise(getBuffer(fileData));
  promise.then(function(data) {
        init(data, files[0].name);
    })
    .catch(function(err) {
    console.log('Error: ',err);
  });
};

function getBuffer(fileData) {
    return function(resolve) {
    var reader = new FileReader();
    reader.readAsArrayBuffer(fileData);
        reader.onload = function() {
            var arrayBuffer = reader.result;
            var bytes = new Uint8Array(arrayBuffer);
            resolve(bytes);
        };
    };
};

input.addEventListener('change', openfile, false);

function init(data, name) {
    input.remove();
    const Left = document.getElementById("Leff");
    var output = document.getElementById("outputA");
    
    let signature = ReadU32(data, 0);



    switch(signature) {
        case 0x49574144:
            WAD.signature = "IWAD";
            break;
        case 0x50574144:
            WAD.signature = "PWAD";
            break;
        default:
        alert("Wrong file signature");
        return;
    }

    WAD.numlumps = LEReadU32(data, 0x4);
    WAD.infotableofs = LEReadU32(data, 0x8);
    console.log(WAD.numlumps)

    for (let i = 0; i < WAD.numlumps;i++) {
        let pointer = WAD.infotableofs + i * 16
        let lump = {
            filepos: LEReadU32(data, pointer),
            size: LEReadU32(data, pointer + 4),
            name: ReadString8(data, pointer + 8),
            data: []
        };
        if (lump.size == 0) WAD.special_lumps.push(i );
        if (lump.size != 0) lump.data = exportdata(data, lump.filepos, lump.size);
        WAD.lumps.push(lump);
    };
    console.log(WAD)
};

