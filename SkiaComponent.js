import React, { useState, useEffect, useRef } from 'react';
import { View, Dimensions, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { Canvas, Circle, useCanvasRef } from '@shopify/react-native-skia';

const SkiaComponent = () => {
  const canvasRef = useCanvasRef();
  const { width, height } = Dimensions.get('window');

  // Function to generate a random radius
  const getRandomRadius = () => Math.floor(Math.random() * 20) + 10; // Random radius between 10 and 30

  // Function to generate a random color
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // Function to generate circles dynamically in a grid
  const generateCircles = () => {
    const circlesArray = [];
    const gridSpacing = 100; // Fixed spacing between circles, you might need to adjust this

    const columns = Math.floor(width / gridSpacing);
    const rows = Math.floor(height / gridSpacing);

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < columns; col++) {
        const radius = getRandomRadius(); // Generate a random radius for each circle
        const x = col * gridSpacing + radius;
        const y = row * gridSpacing + radius;

        if (x + radius <= width && y + radius <= height) {
          circlesArray.push({
            id: circlesArray.length + 1,
            x,
            y,
            radius,
            velocityX: (Math.random() * 4) - 2, // Random X velocity
            velocityY: (Math.random() * 4) - 2, // Random Y velocity
            color: getRandomColor() // Random color
          });
        }
      }
    }

    return circlesArray;
  };

  const [circles, setCircles] = useState(generateCircles());

  useEffect(() => {
    setCircles(generateCircles());
  }, [width, height]);

  const checkCollision = (circle1, circle2) => {
    const dx = circle1.x - circle2.x;
    const dy = circle1.y - circle2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= circle1.radius + circle2.radius; // Check if distance is less than or equal to the sum of radii
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCircles((prevCircles) => {
        const newCircles = prevCircles.map((circle) => {
          let newX = circle.x + circle.velocityX;
          let newY = circle.y + circle.velocityY;

          // Check for collision with the edges and reverse direction if needed
          if (newX - circle.radius < 0 || newX + circle.radius > width) {
            circle.velocityX = -circle.velocityX;
            circle.color = getRandomColor(); // Change color on X collision
            newX = Math.max(circle.radius, Math.min(width - circle.radius, newX));
          }

          if (newY - circle.radius < 0 || newY*1.15 + circle.radius > height) {
            circle.velocityY = -circle.velocityY;
            circle.color = getRandomColor(); // Change color on Y collision
            newY = Math.max(circle.radius, Math.min(height - circle.radius, newY));
          }

          return { ...circle, x: newX, y: newY };
        });

        // Check for collisions between circles
        for (let i = 0; i < newCircles.length; i++) {
          for (let j = i + 1; j < newCircles.length; j++) {
            if (checkCollision(newCircles[i], newCircles[j])) {
              // Swap velocities to simulate elastic collision
              const tempVX = newCircles[i].velocityX;
              const tempVY = newCircles[i].velocityY;
              newCircles[i].velocityX = newCircles[j].velocityX;
              newCircles[i].velocityY = newCircles[j].velocityY;
              newCircles[j].velocityX = tempVX;
              newCircles[j].velocityY = tempVY;

              // Change colors on collision
              newCircles[i].color = getRandomColor();
              newCircles[j].color = getRandomColor();
            }
          }
        }

        return newCircles;
      });
    }, 16); // Approximately 60 FPS

    return () => clearInterval(interval);
  }, [width, height]);

  return (
    <TouchableWithoutFeedback>
      <View style={styles.container}>
        <Canvas style={styles.canvas} ref={canvasRef}>
          {circles.map((circle) => (
            <Circle
              key={circle.id}
              cx={circle.x}
              cy={circle.y}
              r={circle.radius} // Use the radius from the circle's state
              color={circle.color} // Use the color from the circle's state
            />
          ))}
        </Canvas>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvas: {
    width: '100%',
    height: '100%',
  },
});

export default SkiaComponent;