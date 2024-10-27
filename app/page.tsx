"use client"; // Mark this component as a client component

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import styles from "./css/Home.module.css";

import { createClient } from "@/utils/supabase/client";

const targetWord = "moral";
const maxAttempts = 6;

const Home: React.FC = () => {
  const supabase = createClient();

  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [grid, setGrid] = useState<string[]>(Array(maxAttempts * 5).fill(""));
  const [guessInput, setGuessInput] = useState("");
  const [groupName, setGroupName] = useState("");
  const [message, setMessage] = useState("");
  // const [results, setResults] = useState<string[]>(Array(5).fill(""));
  const [results, setResults] = useState<string[]>(
    Array(maxAttempts * 5).fill("")
  );
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [isConfirmed, setIsConfirmed] = useState(false);
  // const [nameConfirmed, setNameConfirmed] = useState(false);
  const [errorName, setErrorName] = useState("");
  const router = useRouter();

  const handleConfirm = () => {
    if (groupName.trim() === "") {
      setErrorName("Please enter a group name.");
    } else {
      setErrorName(""); // Clear error message
      setIsConfirmed(true);
      setIsButtonDisabled(false);
    }
    // setIsConfirmed(true);
    // setNameConfirmed(false);
  };

  const createGrid = () => {
    setGrid(Array(maxAttempts * 5).fill(""));
    // const newGrid = Array(maxAttempts * 5).fill(""); // or however you generate your grid
    // setGrid(newGrid);
  };

  const checkWordValidity = async (word: string): Promise<boolean> => {
    const url = `https://dictionary-by-api-ninjas.p.rapidapi.com/v1/dictionary?word=${word}`;
    const options = {
      headers: {
        "x-rapidapi-key": "process.env.NEXT_PUBLIC_RAPIDAPI_KEY",
        "x-rapidapi-host": "dictionary-by-api-ninjas.p.rapidapi.com",
      },
    };

    try {
      const response = await axios.get(url, options);
      return response.data.valid;
    } catch (error) {
      console.error("Error fetching word validity:", error);
      return false;
    }
  };

  const checkGuess = (guess: string) => {
    const result: string[] = [];
    const targetArray = targetWord.split("");
    const guessArray = guess.split("");

    guessArray.forEach((letter, index) => {
      if (letter === targetArray[index]) {
        result[index] = styles.correct;
        // targetArray[index] = ""; // Use empty string as a marker
      } else if (targetArray.includes(letter)) {
        result[index] = styles.present;
        // targetArray[targetArray.indexOf(letter)] = ""; // Use empty string as a marker
      } else {
        result[index] = styles.absent;
      }
    });

    return result;
  };

  const displayResult = (guess: string, result: string[]) => {
    const newGrid = [...grid];
    const newResult = [...results];
    for (let i = 0; i < 5; i++) {
      newGrid[currentAttempt * 5 + i] = guess[i];
      newResult[currentAttempt * 5 + i] = result[i];
    }
    setGrid(newGrid);
    setResults(newResult);
  };

  const handleGuessSubmit = async () => {
    const guess = guessInput.toLowerCase();

    setIsButtonDisabled(true);

    if (
      guess.length === 5 &&
      currentAttempt < maxAttempts &&
      (await checkWordValidity(guess))
    ) {
      const result = checkGuess(guess);
      displayResult(guess, result);
      setCurrentAttempt((prev) => prev + 1);
      setGuessInput("");

      if (guess === targetWord) {
        setMessage("Congratulations! You've guessed the word!");

        const { data, error } = await supabase.from("user_attempts").insert([
          {
            attempts: currentAttempt,
            username: groupName,
            status: "success",
          },
        ]);

        if (error) {
          console.log("Error inserting:", error);
        }

        router.refresh();
      } else if (currentAttempt + 1 === maxAttempts) {
        setMessage(`Game over! The word was "${targetWord}".`);
        const { data, error } = await supabase.from("user_attempts").insert([
          {
            attempts: currentAttempt,
            username: groupName,
            status: "fail",
          },
        ]);

        if (error) {
          console.log("Error inserting:", error);
        }

        router.refresh();
      }
    } else {
      setMessage("Please enter a valid 5-letter word.");
    }

    // Re-enable the button after 5 seconds
    setTimeout(() => {
      setIsButtonDisabled(false);
    }, 1000);
  };

  useEffect(() => {
    createGrid();
  }, []);

  return (
    <div className={styles.container}>
      Please enter your name first!
      <div className={styles.name}>
        {isConfirmed ? (
          <h2>
            Your group : <span className={styles.groupName}>{groupName}</span>
          </h2>
        ) : (
          <div>
            <input
              type="text"
              placeholder="Kelompok 0"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
            <button onClick={handleConfirm}>Confirm</button>
          </div>
        )}
        <p>{errorName}</p>
      </div>
      <h1>Wordle</h1>
      <div className={styles.grid}>
        {grid.map((cell, index) => (
          <div
            key={`${currentAttempt}-${index}`}
            className={`${styles.cell} ${results[index]}`}
          >
            {cell}
          </div>
        ))}
      </div>
      <div className={styles.guess}>
        <input
          type="text"
          value={guessInput}
          onChange={(e) => setGuessInput(e.target.value)}
          maxLength={5}
        />
        <button onClick={handleGuessSubmit} disabled={isButtonDisabled}>
          Submit Guess
        </button>
      </div>
      <p>{message}</p>
    </div>
  );
};

export default Home;
