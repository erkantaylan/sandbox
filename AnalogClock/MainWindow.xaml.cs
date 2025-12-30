using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Shapes;
using System.Windows.Threading;

namespace AnalogClock;

public partial class MainWindow : Window
{
    private readonly DispatcherTimer _timer;
    private readonly List<FrameworkElement> _hourTexts = new();
    private const double CenterX = 200;
    private const double CenterY = 200;
    private const double Radius = 155;

    public MainWindow()
    {
        InitializeComponent();
        
        DrawClockMarkers();
        
        _timer = new DispatcherTimer
        {
            Interval = TimeSpan.FromMilliseconds(50)
        };
        _timer.Tick += Timer_Tick;
        _timer.Start();
        
        // Initial update
        UpdateClock();
    }

    private void Window_MouseLeftButtonDown(object sender, System.Windows.Input.MouseButtonEventArgs e)
    {
        DragMove();
    }

    private void DrawClockMarkers()
    {
        // Draw minute markers and hour markers
        for (int i = 0; i < 60; i++)
        {
            double angle = i * 6 * Math.PI / 180;
            bool isHour = i % 5 == 0;
            
            double innerRadius = isHour ? Radius - 18 : Radius - 8;
            double outerRadius = Radius;
            
            double x1 = CenterX + innerRadius * Math.Sin(angle);
            double y1 = CenterY - innerRadius * Math.Cos(angle);
            double x2 = CenterX + outerRadius * Math.Sin(angle);
            double y2 = CenterY - outerRadius * Math.Cos(angle);

            var marker = new Line
            {
                X1 = x1,
                Y1 = y1,
                X2 = x2,
                Y2 = y2,
                Stroke = isHour 
                    ? new SolidColorBrush(Color.FromRgb(255, 255, 255)) 
                    : new SolidColorBrush(Color.FromArgb(80, 200, 200, 220)),
                StrokeThickness = isHour ? 3 : 1,
                StrokeStartLineCap = PenLineCap.Round,
                StrokeEndLineCap = PenLineCap.Round
            };

            if (isHour)
            {
                // Add subtle glow to hour markers
                marker.Effect = new System.Windows.Media.Effects.DropShadowEffect
                {
                    Color = Colors.White,
                    BlurRadius = 4,
                    ShadowDepth = 0,
                    Opacity = 0.3
                };
                
                // Add hour numbers
                int hour = i / 5;
                if (hour == 0) hour = 12;
                
                double textRadius = Radius - 35;
                double textX = CenterX + textRadius * Math.Sin(angle) - 13;
                double textY = CenterY - textRadius * Math.Cos(angle) - 13;
                
                // Use a fixed-size Border container to prevent size wobble during rotation
                var container = new Border
                {
                    Width = 26,
                    Height = 26,
                    RenderTransformOrigin = new Point(0.5, 0.5),
                    SnapsToDevicePixels = true,
                    UseLayoutRounding = true
                };
                
                var hourText = new TextBlock
                {
                    Text = hour.ToString(),
                    FontFamily = new FontFamily("Segoe UI"),
                    FontSize = 18,
                    FontWeight = FontWeights.Normal,
                    Foreground = new SolidColorBrush(Color.FromArgb(200, 255, 255, 255)),
                    TextAlignment = TextAlignment.Center,
                    VerticalAlignment = VerticalAlignment.Center,
                    HorizontalAlignment = HorizontalAlignment.Center
                };
                
                container.Child = hourText;
                _hourTexts.Add(container);
                
                Canvas.SetLeft(container, textX);
                Canvas.SetTop(container, textY);
                MarkerCanvas.Children.Add(container);
            }

            MarkerCanvas.Children.Add(marker);
        }
    }

    private void Timer_Tick(object? sender, EventArgs e)
    {
        UpdateClock();
    }

    private void UpdateClock()
    {
        DateTime now = DateTime.Now;
        
        // Calculate angles with smooth movement
        double secondAngle = now.Second * 6 + now.Millisecond * 0.006;
        double minuteAngle = now.Minute * 6 + now.Second * 0.1;
        double hourAngle = (now.Hour % 12) * 30 + now.Minute * 0.5;

        // Rotate the ENTIRE clock face in the OPPOSITE direction of the second hand
        // This makes it look like the second hand is stationary while the face rotates
        RotatingFace.RenderTransform = new RotateTransform(-secondAngle, CenterX, CenterY);
        
        // Counter-rotate hour numbers so they stay upright and readable
        foreach (var hourText in _hourTexts)
        {
            hourText.RenderTransform = new RotateTransform(secondAngle);
        }
        
        // Hour and minute hands rotate normally relative to the face
        // No compensation needed - they move with the rotating face
        HourHand.RenderTransform = new RotateTransform(hourAngle, CenterX, CenterY);
        MinuteHand.RenderTransform = new RotateTransform(minuteAngle, CenterX, CenterY);
        
        // Second hand stays stationary (no transform - it points up)
        // Second tip value stays at fixed position at top
        SecondTip.Text = now.Second.ToString("00");
        
        // Update digital display (rotates with the face)
        DigitalTime.Text = now.ToString("HH:mm:ss");
        DateDisplay.Text = now.ToString("ddd, MMM dd");
    }
}