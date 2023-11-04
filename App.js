import React, { useState, useEffect } from "react";
import { View, TextInput, Button, ScrollView, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import XLSX from "xlsx";
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";

const ROWS = 10;
const COLUMNS = 5;

const App = () => {
  const [gridData, setGridData] = useState([]);

  useEffect(() => {
    // Load data from AsyncStorage when the component mounts
    const loadData = async () => {
      try {
        const data = await AsyncStorage.getItem("gridData");
        if (data) {
          setGridData(JSON.parse(data));
        } else {
          // Initialize grid data with empty strings
          const newData = Array.from({ length: ROWS }, () =>
            Array(COLUMNS).fill("")
          );
          setGridData(newData);
        }
      } catch (error) {
        console.error(error);
      }
    };
    loadData();
  }, []);

  const handleInputChange = (text, rowIndex, colIndex) => {
    const newData = [...gridData];
    newData[rowIndex][colIndex] = text;
    setGridData(newData);
    saveData(newData);
  };

  const saveData = async (data) => {
    try {
      await AsyncStorage.setItem("gridData", JSON.stringify(data));
    } catch (error) {
      console.error(error);
    }
  };

  const downloadExcel = async () => {
    const ws = XLSX.utils.aoa_to_sheet(gridData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });
    const uri = FileSystem.cacheDirectory + "gridData.xlsx";

    try {
      await FileSystem.writeAsStringAsync(uri, wbout, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Use Expo Sharing module to create a shareable download link
      const downloadLink = await Sharing.shareAsync(uri, {
        mimeType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        dialogTitle: "Download File",
        UTI: "com.microsoft.excel.xlsx",
      });

      // Handle the download link, for example, you can log the link to the console
      console.log("Download link:", downloadLink);
    } catch (error) {
      console.error("Error saving file:", error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.gridContainer}>
        {gridData.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((col, colIndex) => (
              <TextInput
                key={colIndex}
                style={styles.input}
                value={col}
                onChangeText={(text) =>
                  handleInputChange(text, rowIndex, colIndex)
                }
              />
            ))}
          </View>
        ))}
      </ScrollView>
      <Button title="Download Excel" onPress={downloadExcel} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  gridContainer: {
    borderWidth: 1,
    borderColor: "black",
  },
  row: {
    flexDirection: "row",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "black",
    padding: 10,
  },
});

export default App;
