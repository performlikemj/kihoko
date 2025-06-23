import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: "Arial", sans-serif;
    line-height: 1.6;
    min-height: 100vh;
    transition: background-color 0.3s ease, color 0.3s ease;
    background-color: ${props => props.theme.background};
    color: ${props => props.theme.text};
  }

  .flex-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    position: relative;
  }

  .flex-container main {
    flex: 1;
    width: 100%;
    padding: 2rem 0;
    margin-bottom: auto;
  }

  .flex-container footer {
    width: 100%;
    padding: 1rem 0;
    margin-top: auto;
    background-color: ${props => props.theme.background};
    border-top: 1px solid ${props => props.theme.border};
  }

  img {
    max-width: 100%;
    height: auto;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  .page-transition {
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.6s ease-out;
  }

  .page-transition.loaded {
    opacity: 1;
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    .flex-container main {
      padding: 1rem 0;
    }
    
    .flex-container footer {
      padding: 0.75rem 0;
    }
  }
`;

export default GlobalStyles; 