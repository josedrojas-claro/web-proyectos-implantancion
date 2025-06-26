// components/Input.jsx
import React from "react";
import styled from "styled-components";

const InputSearch = ({ value, onChange, placeholder = "Buscar...", name = "search" }) => {
  return (
    <StyledWrapper>
      <div className="input-wrapper">
        <input type="text" name={name} value={value} onChange={onChange} placeholder={placeholder} className="input" />
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  /* Fancy-ass Input Styling 2.0 */
  .input-wrapper {
    position: relative;
    width: 100%;
    max-width: 800px;
  }

  .input-wrapper input {
    background-color: #f5f5f5;
    border: 2px solid #ddd;
    padding: 1.2rem 1rem;
    font-size: 1.1rem;
    width: 100%;
    border-radius: 1.5rem;
    color: #ff7f7f;
    box-shadow: 0 0.4rem #dfd9d9, inset 0 0 0 transparent;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  .input-wrapper input:focus {
    outline: none;
    border-color: #ff7f7f;
    box-shadow: 0 0.6rem #dfd9d9, inset 0 0 10px rgba(255, 127, 127, 0.2);
    transform: translateY(-3px) scale(1.01);
  }

  .input-wrapper input::placeholder {
    color: #ccc;
    transition: all 0.3s ease;
  }

  .input-wrapper input:focus::placeholder {
    opacity: 0;
    transform: translateX(10px);
  }

  .input-wrapper::after {
    content: "🔍";
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1.2rem;
    opacity: 0;
    transition: all 0.3s ease;
  }

  .input-wrapper:hover::after {
    opacity: 1;
    right: 1.5rem;
  }

  /* New shit */
  .input-wrapper input:hover {
    background-color: #f9f9f9;
  }

  @keyframes shake {
    0% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(-5px);
    }
    50% {
      transform: translateX(5px);
    }
    75% {
      transform: translateX(-5px);
    }
    100% {
      transform: translateX(0);
    }
  }

  .input-wrapper input:invalid {
    animation: shake 0.5s ease-in-out;
    border-color: #ff4d4d;
  }
`;

export default InputSearch;
