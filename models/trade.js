const { dateTime, DateTime } = require("luxon");
const { v4: uuidv4 } = require('uuid');

const trades = [{
    id: '1',
    itemName: 'Fujifilm X-T4',
    category: 'Camera',
    details: 'The Fujifilm XT4 is a high-performance mirrorless camera that is perfect for photographers of all levels. With its 26.1 MP APS-C X-Trans CMOS 4 Sensor, 5-axis In-body Image Stabilization and 4K Video Recording capabilities, it is sure to take your photography to the next level. The 3.69M-dot OLED Electronic Viewfinder and 3.0" 1.04m-dot Tilting Touchscreen LCD allows you to easily compose and review your shots.',
    status: 'Available',
    image: '/images/fuji_xt4.png'
},
{
    id: '2',
    itemName: 'Canon R5',
    category: 'Camera',
    details: 'The Canon R5 is a high-end full-frame mirrorless camera that is suitable for both professional and enthusiast photographers. It features a 45 MP Full-Frame CMOS Sensor and 5-axis In-body Image Stabilization, providing stunning image quality and stability even in low light conditions. The camera supports 8K Video Recording, making it ideal for videographers as well. The 0.5-inch OLED Electronic Viewfinder and 3.2-inch Vari-angle Touchscreen LCD provides a clear view and allows for easy composition and review of your shots. With its advanced features and versatility, the Canon R5 is a top-of-the-line camera that will take your photography to new heights.',
    status: 'Available',
    image: '/images/canon_r5.png'
},
{
    id: '3',
    itemName: 'Nikon Z9',
    category: 'Camera',
    details: 'The Nikon Z9 is a top-of-the-line full-frame mirrorless camera that is designed for professional photographers and videographers. It boasts a high-resolution 45.7 MP FX-Format BSI CMOS Sensor and advanced 5-axis In-body Image Stabilization, delivering exceptional image quality and stability in any lighting conditions. The camera also supports 8K Video Recording, providing stunning visuals and versatility for videography. The 0.5-inch OLED Electronic Viewfinder and 3.2-inch Touchscreen LCD allows for easy composition and review of your shots. With its advanced features and cutting-edge technology, the Nikon Z9 is a powerful camera that will take your photography to the next level.',
    status: 'Available',
    image: '/images/nikon_z9.png'
},
{
    id: '4',
    itemName: 'Panasonic Lumix S1',
    category: 'Camera',
    details: 'The Panasonic Lumix S1 is a mirrorless camera that is aimed at professional photographers and videographers. It boasts a high-resolution 24.2 MP CMOS sensor and advanced image stabilizationization technology, ensuring top-notch image quality in a variety of lighting conditions. The camera also supports 4K video recording, providing stunning visuals and versatility for videographers. The OLED electronic viewfinder and touch screen LCD offer a convenient shooting experience, allowing for easy composition and image review. With its comprehensive feature set and cutting-edge technology, the Panasonic Lumix S1 is a high-performing camera that is ideal for photographers looking to elevate their work.',
    status: 'Available',
    image: '/images/panasonic_lumix.png'
},
{
    id: '5',
    itemName: 'Fujifilm XF 18-55mm f/2.8-4 R LM',
    category: 'Lens',
    details: 'This versatile lens is a great option for the Fujifilm X-mount lineup. With its 18-55mm focal length range, it covers a wide range of shooting situations, making it ideal for travel, landscapes, and everyday photography. The f/2.8-4 maximum aperture provides excellent low-light performance and bokeh, while the built-in image stabilization helps to reduce camera shake. The compact and lightweight design of this lens makes it a great option for photographers on the go.',
    status: 'Available',
    image: '/images/fuji_1855.png'
},
{
    id: '6',
    itemName: 'Canon RF 70-200mm f/2.8 L IS USM',
    category: 'Lens',
    details: 'The Canon RF 70-200mm f/2.8 L IS USM Lens is a top-notch lens for the Canon R-series cameras. With its 70-200mm focal length, it is ideal for portraits, sports, and wildlife photography. The f/2.8 maximum aperture provides excellent low-light performance, while the built-in image stabilization helps to reduce camera shake. The lens is also fast and silent, thanks to its Ultrasonic Motor (USM) autofocus system. This lens is a must-have for any professional or serious hobbyist.',
    status: 'Available',
    image: '/images/canon_70200.png'
},
{
    id: '7',
    itemName: 'Nikon Z 70-200mm f/2.8 VR S',
    category: 'Lens',
    details: 'The Nikon Z 70-200mm f/2.8 VR S Lens is a high-performance lens for the newest generation Nikon cameras. With its 70-200mm focal length, it is ideal for portraits, sports, and wildlife photography. The f/2.8 maximum aperture provides excellent low-light performance, while the built-in Vibration Reduction (VR) system helps to reduce camera shake. The lens is also fast and silent, thanks to its advanced Stepping Motor (S) autofocus system. This lens is a top-choice for professional photographers and videographers alike.',
    status: 'Available',
    image: '/images/nikon_70200.png'
},
{
    id: '8',
    itemName: 'Panasonic Lumix S Pro 50mm f/1.4',
    category: 'Lens',
    details: 'The Panasonic Lumix S Pro 50mm f/1.4 lens is a premier standard prime lens that is engineered for professional photographers and videographers. Its fast f/1.4 aperture and high-quality optical elements produce stunning image quality and beautiful bokeh. Whether you are shooting portraits, working in low light, or just capturing everyday moments, this lens is a versatile tool that can help you achieve your creative vision. Its compact design and natural perspective make it an ideal choice for a wide range of photography applications. With its advanced features and performance, the Panasonic Lumix S Pro 50mm f/1.4 lens is a must-have for photographers who have a passion for quality and creativity.',
    status: 'Available',
    image: '/images/panasonic_50.png'
}]

exports.find = function () {
    return trades;
}

exports.findById = function (id) {
    return trades.find(trade => trade.id === id);
}

exports.save = function (trade) {
    trade.id = uuidv4();
    trades.push(trade);
}

exports.updateById = function (id, newTrade) {
    let trade = trades.find(trade => trade.id === id);
    if (trade) {
        trade.itemName = newTrade.itemName;
        trade.category = newTrade.category;
        trade.details = newTrade.details;
        trade.status = newTrade.status;
        return true;
    } else {
        return false;
    }
}

exports.deleteById = function (id) {
    let index = trades.findIndex(trade => trade.id === id);
    if (index !== -1) {
        trades.splice(index, 1);
        return true;
    } else {
        return false;
    }
}