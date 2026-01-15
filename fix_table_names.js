const fs = require('fs');
const path = require('path');

// Function to recursively find all .js files in a directory
function findAllJSFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            // Skip node_modules and other unnecessary directories
            if (!filePath.includes('node_modules') && !filePath.includes('.git')) {
                findAllJSFiles(filePath, fileList);
            }
        } else if (stat.isFile() && file.endsWith('.js')) {
            fileList.push(filePath);
        }
    });
    
    return fileList;
}

// Function to fix table names in a file
function fixTableNamesInFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;
        
        // Replace 'FROM users' with 'FROM Users'
        content = content.replace(/FROM\s+users\b/gi, 'FROM Users');
        
        // Replace 'from users' with 'from Users' (case insensitive)
        content = content.replace(/from\s+users\b/gi, 'from Users');
        
        // Replace '`users`' with '`Users`'
        content = content.replace(/`users`/gi, '`Users`');
        
        // If changes were made, write the file
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✓ Fixed: ${filePath}`);
            return true;
        }
        return false;
    } catch (error) {
        console.error(`✗ Error processing ${filePath}:`, error.message);
        return false;
    }
}

// Main function
function fixAllTableNames() {
    console.log('🔍 Searching for JavaScript files to fix table names...\n');
    
    const controllerDir = './controller';
    const routeDir = './routes';
    
    let fixedFiles = 0;
    
    // Fix controller files
    if (fs.existsSync(controllerDir)) {
        console.log('🔧 Processing controller files:');
        const controllerFiles = findAllJSFiles(controllerDir);
        controllerFiles.forEach(file => {
            if (fixTableNamesInFile(file)) {
                fixedFiles++;
            }
        });
    }
    
    // Fix route files (though less likely to have SQL)
    if (fs.existsSync(routeDir)) {
        console.log('\n🔧 Processing route files:');
        const routeFiles = findAllJSFiles(routeDir);
        routeFiles.forEach(file => {
            if (fixTableNamesInFile(file)) {
                fixedFiles++;
            }
        });
    }
    
    console.log(`\n✅ Table name fixing completed!`);
    console.log(`📝 Files modified: ${fixedFiles}`);
    console.log(`\n💡 Changed 'users' → 'Users' in SQL queries`);
}

// Run the fix
fixAllTableNames();