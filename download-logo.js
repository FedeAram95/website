const https = require('https');
const fs = require('fs');
const url = "https://scontent-eze1-2.cdninstagram.com/v/t51.2885-19/436140997_795869332090572_4979399494807030126_n.jpg?stp=dst-jpg_s320x320_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby42NDAuYzIifQ&_nc_ht=scontent-eze1-2.cdninstagram.com&_nc_cat=100&_nc_oc=Q6cZ2gFG_UQzCnUvWlx6HcU9yI7-SUe5THOuaWbj0XRQ0-0_fS5imz-xsMwzYtpiUN-GqIA&_nc_ohc=alSFoq2W0QUQ7kNvwHhGFjI&_nc_gid=6TBB93BB_aetg56Oy1xOEw&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_Af200dT4FwOhBhfYj09e3tfUaw9GeyY8PkoGVUy5smzKMQ&oe=69D9FBC7&_nc_sid=8b3546";

https.get(url, (res) => {
  if (res.statusCode !== 200) {
    console.error('Failed to download', res.statusCode);
  } else {
    const file = fs.createWriteStream('public/logo.jpg');
    res.pipe(file);
    file.on('finish', () => { 
      file.close(); 
      console.log('Download complete'); 
    });
  }
}).on('error', (err) => console.error(err));
