import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Database, Play, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QueryResult {
  columns: string[];
  rows: any[][];
  message?: string;
}

export default function DatabasePage() {
  const [query, setQuery] = useState("SELECT * FROM users LIMIT 10;");
  const [result, setResult] = useState<QueryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const executeQuery = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/db/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query.trim() }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Query failed');
      }

      setResult(data);
      toast({
        title: "Query executed successfully",
        description: `${data.rows?.length || 0} rows returned`,
      });
    } catch (error) {
      toast({
        title: "Query failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQueries = [
    { label: "View all users", query: "SELECT id, username, email, role, created_at FROM users;" },
    { label: "View all medications", query: "SELECT m.*, u.username FROM medications m LEFT JOIN users u ON m.user_id = u.id;" },
    { label: "View medication logs", query: "SELECT ml.*, m.name as medication_name, u.username FROM medication_logs ml LEFT JOIN medications m ON ml.medication_id = m.id LEFT JOIN users u ON ml.user_id = u.id LIMIT 20;" },
    { label: "Count records", query: "SELECT 'users' as table_name, COUNT(*) as count FROM users UNION ALL SELECT 'medications', COUNT(*) FROM medications UNION ALL SELECT 'medication_logs', COUNT(*) FROM medication_logs;" },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Database className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Database Query Tool</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Queries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {quickQueries.map((item, index) => (
              <Button
                key={index}
                variant="outline"
                onClick={() => setQuery(item.query)}
                className="justify-start"
              >
                {item.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SQL Query</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Enter your SQL query here..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={6}
            className="font-mono"
          />
          <div className="flex gap-2">
            <Button onClick={executeQuery} disabled={isLoading}>
              <Play className="w-4 h-4 mr-2" />
              {isLoading ? "Executing..." : "Execute Query"}
            </Button>
            <Button variant="outline" onClick={() => setQuery("")}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Query Results</CardTitle>
          </CardHeader>
          <CardContent>
            {result.message ? (
              <p className="text-green-600 font-medium">{result.message}</p>
            ) : result.rows && result.rows.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {result.columns.map((column, index) => (
                        <TableHead key={index}>{column}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.rows.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <TableCell key={cellIndex}>
                            {cell === null ? (
                              <span className="text-gray-400 italic">NULL</span>
                            ) : (
                              String(cell)
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-gray-500">No results returned</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}