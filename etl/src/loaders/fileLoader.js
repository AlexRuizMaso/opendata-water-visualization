import fs from 'fs';
import path from 'path';
import config from '../config.js';

/**
 * Loader for writing transformed data to files
 * Handles JSON output and backup management
 */
class DataLoader {
  constructor() {
    this.dataDir = config.paths.data;
    this.ensureDirectories();
  }

  /**
   * Ensure required directories exist
   */
  ensureDirectories() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
      console.log(`📁 Created data directory: ${this.dataDir}`);
    }
  }

  /**
   * Save transformed data to JSON file
   * @param {string} filename - Output filename
   * @param {Object} data - Data to save
   * @param {boolean} createBackup - Whether to backup existing file
   */
  saveJSON(filename, data, createBackup = true) {
    try {
      const filepath = path.join(this.dataDir, filename);

      // Create backup if file exists
      if (createBackup && fs.existsSync(filepath)) {
        const timestamp = new Date().toISOString().split('T')[0];
        const backupName = `${filename.replace('.json', '')}.backup.${timestamp}.json`;
        const backupPath = path.join(this.dataDir, backupName);

        if (!fs.existsSync(backupPath)) {
          fs.copyFileSync(filepath, backupPath);
          console.log(`💾 Created backup: ${backupName}`);
        }
      }

      // Before writing, ensure directory permissions
      const dirPath = path.dirname(filepath);
      if (!fs.existsSync(dirPath)) {
        throw new Error(`Destination directory does not exist: ${dirPath}`);
      }
      // Write new file
      fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`✅ Saved: ${filename} (${Math.round(fs.statSync(filepath).size / 1024)} KB)`);

      return filepath;
    } catch (error) {
      console.error(`❌ Error saving ${filename}:`, error.message);
      throw error;
    }
  }

  /**
   * Load JSON file
   * @param {string} filename - Filename to load
   * @returns {Object} Loaded data
   */
  loadJSON(filename) {
    try {
      const filepath = path.join(this.dataDir, filename);

      if (!fs.existsSync(filepath)) {
        console.warn(`⚠️  File not found: ${filename}`);
        return null;
      }

      const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
      console.log(`✅ Loaded: ${filename}`);
      return data;
    } catch (error) {
      console.error(`❌ Error loading ${filename}:`, error.message);
      throw error;
    }
  }

  /**
   * Load embassaments data
   * @returns {Object} Embassaments data
   */
  loadEmbassaments() {
    return this.loadJSON(config.output.embassaments);
  }

  /**
   * Load precipitation data
   * @returns {Object} Precipitation data
   */
  loadPrecipitation() {
    return this.loadJSON(config.output.precipitation);
  }

  /**
   * Save embassaments data
   * @param {Object} data - Transformed embassaments data
   */
  saveEmbassaments(data) {
    return this.saveJSON(config.output.embassaments, data);
  }

  /**
   * Save precipitation data
   * @param {Object} data - Transformed precipitation data
   */
  savePrecipitation(data) {
    return this.saveJSON(config.output.precipitation, data);
  }

  /**
   * Save metadata about ETL run
   * @param {Object} metadata - Metadata object
   */
  saveMetadata(metadata) {
    return this.saveJSON(config.output.metadata, metadata);
  }

  /**
   * Get list of all backup files
   * @returns {Array} List of backup filenames
   */
  getBackupFiles() {
    try {
      const files = fs.readdirSync(this.dataDir);
      return files.filter(f => f.includes('.backup.')).sort().reverse();
    } catch (error) {
      console.error('❌ Error listing backup files:', error.message);
      return [];
    }
  }

  /**
   * Clean old backup files (keep only last N days)
   * @param {number} daysToKeep - Number of days of backups to keep
   */
  cleanOldBackups(daysToKeep = 30) {
    try {
      const backups = this.getBackupFiles();
      const now = new Date();

      backups.forEach(backup => {
        const dateMatch = backup.match(/\.backup\.(\d{4}-\d{2}-\d{2})\./);
        if (dateMatch) {
          const backupDate = new Date(dateMatch[1]);
          const daysDiff = (now - backupDate) / (1000 * 60 * 60 * 24);

          if (daysDiff > daysToKeep) {
            const filepath = path.join(this.dataDir, backup);
            fs.unlinkSync(filepath);
            console.log(`🗑️  Deleted old backup: ${backup}`);
          }
        }
      });
    } catch (error) {
      console.error('❌ Error cleaning backups:', error.message);
    }
  }

  /**
   * Get size of data directory
   * @returns {number} Size in bytes
   */
  getDataDirSize() {
    try {
      const files = fs.readdirSync(this.dataDir);
      let totalSize = 0;

      files.forEach(file => {
        const filepath = path.join(this.dataDir, file);
        const stats = fs.statSync(filepath);
        totalSize += stats.size;
      });

      return totalSize;
    } catch (error) {
      console.error('❌ Error calculating directory size:', error.message);
      return 0;
    }
  }

  /**
   * Get statistics about saved files
   * @returns {Object} Statistics
   */
  getStatistics() {
    try {
      const files = fs.readdirSync(this.dataDir);
      const mainFiles = files.filter(f => !f.includes('.backup.'));
      const backupFiles = files.filter(f => f.includes('.backup.'));
      const totalSize = this.getDataDirSize();

      return {
        mainFiles: mainFiles.length,
        backupFiles: backupFiles.length,
        totalFiles: files.length,
        totalSizeKB: (totalSize / 1024).toFixed(2),
        totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      };
    } catch (error) {
      console.error('❌ Error getting statistics:', error.message);
      return {};
    }
  }
}

export default DataLoader;
