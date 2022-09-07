const puppeteer = require("puppeteer");

const url = "https://www12.honolulu.gov/csdarts/frmAppInt.aspx";

async function getApps() {
  //opens correct browser
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false,
    args:[
      '--no-sandobx',
    ]
  });
  var fs = require('fs');
    fs.writeFile("array.txt", '', err => {
        if(err) {
            console.error(err)
            return
        }
    });
  
  let time;
  let openApps;
  let openTime;
  let loctd;
  let loctdnum;
  let locth;
  let loc;
  let cleanloc;
  let prevDate = 0;
  let currDate = 1;

  const schedule = [];
  const page = await browser.newPage();
  let screen = 1;
  await page.goto(url);
  await page.click("#btnAccept");

  while(currDate !== prevDate) {
    if(screen > 1) {
      await page.waitForSelector("#HiddenSideMenu");
      await page.click("#btnDateJumpAgain");
    }

  const table = await page.waitForSelector("#dlstAppointment");
  const tableBody = await table.waitForSelector("tbody");

  const td = await tableBody.waitForSelector("td");
  const input = await td.$$("input");

  const dateloc = await page.waitForSelector("#lblDate")
  const date = await dateloc.evaluate(el => el.textContent);
  prevDate = currDate;
  currDate = date;


  for(let i = 0; i < input.length; i++) {
    openApps = + await input[i].evaluate(el => el.value);

    timetr = (await input[i].$x('../..'))[0];
    time = await timetr.waitForSelector("span");
    openTime = await time.evaluate(el => el.textContent);

    loctd = (await input[i].$x('..'))[0];
    loctdnum = await loctd.evaluate(el => el.cellIndex) + 1;
    locth = await tableBody.waitForSelector("th:nth-child(" + loctdnum + ")");
    loc = await locth.evaluate(el => el.textContent);
    cleanloc = loc.replace(/\s+/g, " ").trim();
    schedule.push([date, cleanloc , openTime, openApps]);
    writeFile("OpenAppointments.txt", date, cleanloc, openTime, openApps);
  }
  screen+=1;
}
  console.log("Appointment Documentation Finished!" );
  return page;
}

function writeFile(file, date, cleanloc, openTime, openApps) {
  var fs = require('fs');
  var logger = fs.createWriteStream(file, {
      flags: 'a'
  })
  logger.write(date + '\t' + cleanloc + '\t' + openTime + '\t' + openApps + '\n');
}

getApps();

