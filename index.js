const fs = require("fs").promises;
const path = require("path");

async function calculatePurchasesTotal(purchasesFiles) {
  let purchasesTotal = 0;
  // loop over each file path in the purchasesFiles array
  for (file of purchasesFiles) {
    // read the file and parse the contents as JSON
    const data = JSON.parse(await fs.readFile(file));
    // Add the amount in the data.total field to the purchasesTotal variable
    purchasesTotal += data.total;
  }
  return purchasesTotal;
}

async function findPurchasesFiles(folderName) {
  // this array will hold purchases files as they are found
  let purchasesFiles = [];

  async function findFiles(folderName) {
    // read all the items in the current folder
    const items = await fs.readdir(folderName, { withFileTypes: true });

    // iterate over each found item
    for (item of items) {
      // if the item is a directory, it will need to be searched
      if (item.isDirectory()) {
        // call this method recursively, appending the folder name to make a new path
        await findFiles(path.join(folderName, item.name));
      } else {
        // Make sure the discovered file is a .json file
        if (path.extname(item.name) === ".json") {
          // store the file path in the purchasesFiles array
          purchasesFiles.push(path.join(folderName, item.name));
        }
      }
    }
  }

  await findFiles(folderName);

  return purchasesFiles;
}

async function main() {
  const purchasesDir = path.join(__dirname, "shopping");
  const purchasesTotalsDir = path.join(__dirname, "totalsShopping");

  // create the purchasesTotal directory if it doesn't exist
  try {
    await fs.mkdir(purchasesTotalsDir);
  } catch {
    console.log(`${purchasesTotalsDir} already exists.`);
  }

  // find paths to all the purchases files
  const purchasesFiles = await findPurchasesFiles(purchasesDir);

  // read through each purchases file to calculate the purchases total
  const purchasesTotal = await calculatePurchasesTotal(purchasesFiles);

  // write the total to the "totals.json" file
  await fs.writeFile(
    path.join(purchasesTotalsDir, "totals.txt"),
    `${purchasesTotal}\r\n`,
    { flag: "w" }
  );
  console.log(`Wrote purchases totals to ${purchasesTotalsDir}`);
}

main();