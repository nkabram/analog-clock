import { useState, useEffect } from 'react';

function Scratchpad() {
  const [scratchpad, setScratchpad] = useState(() => {
    // Initialize state with saved content from localStorage
    const savedContent = localStorage.getItem('scratchpadContent');
    return savedContent || '';
  });

  // Save to localStorage whenever content changes
  useEffect(() => {
    localStorage.setItem('scratchpadContent', scratchpad);
  }, [scratchpad]);

  const handleChange = (e) => {
    setScratchpad(e.target.value);
  };

  return (
    <div className="scratchpad">
      <textarea
        placeholder="Scratchpad..."
        value={scratchpad}
        onChange={handleChange}
        className="scratchpad-textarea"
      />
    </div>
  );
}

export default Scratchpad;